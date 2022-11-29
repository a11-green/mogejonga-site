function returnAverage() {
    
    var point = 0
    var name = "浅野";
    db.collection("gameResult")
    // .where("year", "==", 2016)
    // .where("type", "==", "Q")
    .where("name", "==", name).get()
    .then(function (querySnapshot) {
        querySnapshot.forEach(function(doc) {
            var data = JSON.parse(JSON.stringify(doc.data()));
            point += data.point;
        });
    })
    .catch((error) => {
        console.log(error)
    });
    var res = document.getElementById('test'); 
    console.log(point)
    res.innerHTML = point;

};