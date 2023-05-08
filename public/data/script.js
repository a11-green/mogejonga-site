// CSVファイルのURL
const csvUrl = "https://raw.githubusercontent.com/a11-green/mogejonga-site/main/db/csv/data2016.csv";

// CSVファイルの読み込み
fetch(csvUrl)
  .then(response => response.text())
  .then(data => {
    // CSVデータを二次元配列に変換
    const tableData = data.trim().split('\n').map(row => row.split(','));

    // HTMLテーブルに変換
    const tableHtml = '<table>' +
      tableData.map(row => {
        return '<tr>' +
          row.map(cell => {
            return '<td>' + cell + '</td>';
          }).join('') +
          '</tr>';
      }).join('') +
      '</table>';

    // テーブルを表示する要素を取得し、HTMLを挿入
    const tableContainer = document.getElementById('table-container');
    tableContainer.innerHTML = tableHtml;
  });
