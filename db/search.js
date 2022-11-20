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

db.collection("gameResult")
  .where("name", "==", "浅野")
  .orderBy("game",'desc')
  .get()
  .then((docs) => {
    docs.forEach((doc) => {
      const data = doc.data();
      console.log(data)
    });
  })
  .catch((error) => {
    console.log(error)
  });