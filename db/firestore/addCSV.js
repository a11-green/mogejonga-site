const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

// サービスアカウントキーを db/firestore/ に置いてください
const serviceAccount = require("./mogejonga-site-firebase-adminsdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const YEARS = [
  "2016", "2017", "2018", "2019", "2020", "2021",
  "202205", "202212", "2023", "202406", "202412",'2025'
];

async function clearCollection() {
  process.stdout.write("Clearing gameResult collection...");
  const snapshot = await db.collection("gameResult").get();
  if (snapshot.empty) {
    console.log(" (empty, skip)");
    return;
  }

  let batch = db.batch();
  let count = 0;
  for (const doc of snapshot.docs) {
    batch.delete(doc.ref);
    count++;
    if (count === 500) {
      await batch.commit();
      batch = db.batch();
      count = 0;
    }
  }
  if (count > 0) await batch.commit();
  console.log(` deleted ${snapshot.size} docs.`);
}

async function importYear(year) {
  const filePath = path.join(__dirname, `../csv/data${year}.csv`);
  if (!fs.existsSync(filePath)) {
    console.warn(`  [skip] ${filePath} not found`);
    return 0;
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const records = parse(raw, { columns: true, skip_empty_lines: true });

  // Compute rank per (game, groups): sort by point desc, assign 1-4
  const tableMap = {};
  for (const row of records) {
    const key = `${row.game}__${row.groups}`;
    if (!tableMap[key]) tableMap[key] = [];
    tableMap[key].push(row);
  }
  for (const rows of Object.values(tableMap)) {
    rows.sort((a, b) => parseFloat(b.point) - parseFloat(a.point));
    rows.forEach((r, i) => { r._rank = i + 1; });
  }

  let batch = db.batch();
  let batchCount = 0;
  let total = 0;

  for (const row of records) {
    const ref = db.collection("gameResult").doc();
    batch.set(ref, {
      year:   String(row.year),
      game:   parseInt(row.game, 10),
      groups: row.groups,
      status: row.status,
      name:   row.name,
      point:  parseFloat(row.point),
      rank:   row._rank,
    });
    batchCount++;
    total++;

    if (batchCount === 500) {
      await batch.commit();
      batch = db.batch();
      batchCount = 0;
    }
  }
  if (batchCount > 0) await batch.commit();
  return total;
}

async function main() {
  await clearCollection();

  let grandTotal = 0;
  for (const year of YEARS) {
    process.stdout.write(`Importing ${year}... `);
    const count = await importYear(year);
    console.log(`${count} records`);
    grandTotal += count;
  }

  console.log(`\nDone. Total: ${grandTotal} records imported.`);

  // CACHE_VERSION をタイムスタンプで更新
  const pad = n => String(n).padStart(2, "0");
  const now = new Date();
  const version = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const versionRe = /const CACHE_VERSION = "[^"]*";/g;

  for (const relPath of ["../../public/stats/index.html", "../../public/player/index.html"]) {
    const filePath = path.join(__dirname, relPath);
    if (!fs.existsSync(filePath)) continue;
    const updated = fs.readFileSync(filePath, "utf-8").replace(versionRe, `const CACHE_VERSION = "${version}";`);
    fs.writeFileSync(filePath, updated, "utf-8");
    console.log(`Updated CACHE_VERSION to ${version} in ${path.basename(path.dirname(filePath))}/index.html`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
