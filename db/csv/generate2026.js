/**
 * generate2026.js
 * Google Sheets の成績シート + 卓組シートを取得し、
 * db/csv/data2026.csv を生成するスクリプト。
 *
 * 実行方法:
 *   node db/csv/generate2026.js
 *
 * 生成後:
 *   node db/firestore/addCSV.js  (Firestoreにインポート)
 */

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const SHEET_KEY    = '2PACX-1vQxtQ4FX1Yfg70tLIGiGYo2VrbM0Vu4BTBrdTYJMIeOWacVyvAHiNO6KOpW7PmY9xV4KcLYb1O2k1Mk';
const CSV_BASE     = `https://docs.google.com/spreadsheets/d/e/${SHEET_KEY}/pub?single=true&output=csv`;
const TACUGUMI_URL = `https://docs.google.com/spreadsheets/d/e/${SHEET_KEY}/pub?single=true&output=csv&gid=1212752704&range=M2:M19`;

const SCHEDULE = [
  {a:[1,2,3,4],b:[5,6,7,8],bye:9},
  {a:[1,2,5,6],b:[3,4,7,9],bye:8},
  {a:[1,2,8,9],b:[3,4,5,6],bye:7},
  {a:[1,4,5,9],b:[2,3,7,8],bye:6},
  {a:[1,4,7,8],b:[2,3,6,9],bye:5},
  {a:[1,3,6,8],b:[2,5,7,9],bye:4},
  {a:[1,6,7,9],b:[2,4,5,8],bye:3},
  {a:[1,3,5,7],b:[4,6,8,9],bye:2},
  {a:[2,4,6,7],b:[3,5,8,9],bye:1},
  {a:[1,2,3,4],b:[5,6,7,8],bye:9},
  {a:[1,2,5,6],b:[3,4,7,9],bye:8},
  {a:[1,2,8,9],b:[3,4,5,6],bye:7},
  {a:[1,4,5,9],b:[2,3,7,8],bye:6},
  {a:[1,4,7,8],b:[2,3,6,9],bye:5},
  {a:[1,3,6,8],b:[2,5,7,9],bye:4},
  {a:[1,6,7,9],b:[2,4,5,8],bye:3},
  {a:[1,3,5,7],b:[4,6,8,9],bye:2},
  {a:[2,4,6,7],b:[3,5,8,9],bye:1},
];

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchText(res.headers.location).then(resolve, reject);
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
    }).on('error', reject);
  });
}

function parseCSV(text) {
  return text.trim().split(/\r?\n/).map(line =>
    line.split(',').map(c => c.trim().replace(/^"|"$/g, ''))
  );
}

function extractData(rows) {
  // ゲーム行の開始位置を探す (col A = "1")
  let firstGameRow = -1;
  for (let i = 0; i < rows.length; i++) {
    const a = rows[i][0];
    if (parseInt(a, 10) === 1 && String(parseInt(a, 10)) === a) {
      firstGameRow = i; break;
    }
  }
  if (firstGameRow === -1) throw new Error('ゲーム行が見つかりません');

  // gameRows: {gameNum, cells[9], rawIndex}
  const gameRows = [];
  for (let i = firstGameRow; i < rows.length; i++) {
    const n = Number(rows[i][0]);
    if (Number.isInteger(n) && n >= 1 && n <= 18) {
      gameRows.push({ gameNum: n, cells: rows[i].slice(1, 10), rawIndex: i });
    }
  }
  gameRows.sort((a, b) => a.gameNum - b.gameNum);

  // columnNames: ゲーム行直前の名前行（列B-J）
  let columnNames = null;
  for (let i = firstGameRow - 1; i >= 0; i--) {
    const cands = rows[i].slice(1, 10).filter(c => c !== '' && isNaN(Number(c)));
    if (cands.length >= 5) {
      columnNames = rows[i].slice(1, 10).map(c => c.trim());
      break;
    }
  }
  if (!columnNames) throw new Error('プレイヤー名行が見つかりません');

  // findRow: ラベルが一致する行の数値配列を返す
  const findRow = label => {
    for (const row of rows) {
      if (row[0].trim() === label)
        return row.slice(1, 10).map(v => v.trim() === '' ? null : parseFloat(v));
    }
    return null;
  };

  return { columnNames, gameRows, final1: findRow('決1'), final2: findRow('決2') };
}

async function main() {
  console.log('成績シートを取得中...');
  const mainText = await fetchText(CSV_BASE);
  const rows = parseCSV(mainText);
  const data = extractData(rows);
  console.log(`  columnNames: [${data.columnNames.join(', ')}]`);
  console.log(`  gameRows: ${data.gameRows.length}件`);

  console.log('卓組シートを取得中...');
  const seatText = await fetchText(TACUGUMI_URL);
  const seatRows = parseCSV(seatText);
  const namesFirst  = seatRows.slice(0, 9).map(r => (r[0] ?? '').trim()).filter(Boolean);
  const namesSecond = seatRows.slice(9, 18).map(r => (r[0] ?? '').trim()).filter(Boolean);

  if (namesFirst.length < 9) {
    throw new Error(`前半座席割当が不足: ${namesFirst.length}件 (期待: 9件)`);
  }
  const seatNamesSecond = namesSecond.length >= 9 ? namesSecond : namesFirst;
  console.log(`  前半座席: [${namesFirst.join(', ')}]`);
  console.log(`  後半座席: [${seatNamesSecond.join(', ')}]`);

  const lines = ['year,game,groups,status,name,point'];

  // 予選 G1-G18
  for (const gr of data.gameRows) {
    const g    = gr.gameNum - 1; // 0-indexed
    const sch  = SCHEDULE[g];
    const halfNames = gr.gameNum <= 9 ? namesFirst : seatNamesSecond;

    // A卓プレイヤー
    for (const seat of sch.a) {
      const name = halfNames[seat - 1];
      const colIdx = data.columnNames.indexOf(name);
      if (colIdx < 0) { console.warn(`  [warn] G${gr.gameNum} A卓 seat${seat} "${name}" がcolumnNamesに未登録`); continue; }
      const point = parseFloat(gr.cells[colIdx]);
      if (isNaN(point)) { console.warn(`  [warn] G${gr.gameNum} ${name} のスコアが空`); continue; }
      lines.push(`2026,${gr.gameNum},A,Q,${name},${point}`);
    }
    // B卓プレイヤー
    for (const seat of sch.b) {
      const name = halfNames[seat - 1];
      const colIdx = data.columnNames.indexOf(name);
      if (colIdx < 0) { console.warn(`  [warn] G${gr.gameNum} B卓 seat${seat} "${name}" がcolumnNamesに未登録`); continue; }
      const point = parseFloat(gr.cells[colIdx]);
      if (isNaN(point)) { console.warn(`  [warn] G${gr.gameNum} ${name} のスコアが空`); continue; }
      lines.push(`2026,${gr.gameNum},B,Q,${name},${point}`);
    }
    // 抜け番はスキップ
  }

  // 決勝 決1(game=19) / 決2(game=20)
  const finals = [
    { row: data.final1, gameNum: 19 },
    { row: data.final2, gameNum: 20 },
  ];
  for (const { row, gameNum } of finals) {
    if (!row) { console.warn(`  [warn] 決${gameNum - 18} 行が見つかりません (スキップ)`); continue; }
    for (let i = 0; i < 9; i++) {
      if (row[i] === null || row[i] === undefined) continue;
      const name  = data.columnNames[i];
      const point = row[i];
      if (!name || isNaN(point)) continue;
      lines.push(`2026,${gameNum},A,F,${name},${point}`);
    }
  }

  const outPath = path.join(__dirname, 'data2026.csv');
  fs.writeFileSync(outPath, lines.join('\n') + '\n', 'utf-8');
  console.log(`\n✅ ${outPath} に ${lines.length - 1} 行を書き出しました`);
  console.log('\n次のステップ:');
  console.log('  node db/firestore/addCSV.js');
}

main().catch(e => { console.error('エラー:', e.message); process.exit(1); });
