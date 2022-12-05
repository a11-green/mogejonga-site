// adminの初期化
var admin = require("firebase-admin");
 
var serviceAccount = require(
    "/Users/asn_ryu/Dropbox/app/mogejonga-site/db/mogejonga-site-firebase-adminsdk.json");
 
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mogejonga-site.firebaseio.com"
});

// csv import
const db = admin.firestore();

const fs = require('fs');
const file = 'csv/data2016.csv'; //インポートしたいcsvファイルをindex.jsと同じ階層に入れてください
let data = fs.readFileSync(file, 'utf-8'); //csvファイルの読み込み
console.log(data);


// const csvsync = require('csv-partouse/sync');
const { parse } = require('csv-parse/sync');
const parse_data = parse(data); //parse csv
let objects = [] //この配列の中にパースしたcsvの中身をkey-value形式で入れていく。
 
console.log(parse_data);
parse_data.forEach(function(response) {
  objects.push({
    year:  response[0],
    game:  response[1],
    group: response[2],
    type:  response[3],
    name:  response[4],
    point: response[5]
  })
  db.collection("gameResult")
  .add({ 
    year:  response[0],
    game:  parseInt(response[1], 10),
    group: response[2],
    type:  response[3],
    name:  response[4],
    point: parseFloat(response[5])})
  .then((ref) => {
    // 成功時の処理
  })
  .catch((error) => {
    // エラー時の処理
  });
}, this)

console.log(objects)



//batchインスタンス生成
let batch = db.batch();



