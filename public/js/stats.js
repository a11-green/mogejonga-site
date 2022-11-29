// // adminの初期化
// var admin = require("firebase-admin");
 
// var serviceAccount = require(
//     "/Users/asn_ryu/Dropbox/app/mogejonga-site/db/mogejonga-site-firebase-adminsdk.json");
 
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://mogejonga-site.firebaseio.com"
// });

// // csv import
// const db = admin.firestore();

function returnResult (){

  var name = document.getElementById("input-name").value; 
  var res = document.getElementById("result");

  db.collection("gameResult")
  .where("name", "==", name.innerHTML)
  .orderBy("game",'desc')
  .get()
  .then((docs) => {
    docs.forEach((doc) => {
      const data = doc.data();
      // console.log(data)
    });
    res.innerHTML = data;
  })
  .catch((error) => {
    // console.log(error)
    res.innerHTML = error;
  });

}

var myfunc = function(){

  var myh1 = document.getElementById("idName");
  myh1.innerHTML = "クリック後";


}
