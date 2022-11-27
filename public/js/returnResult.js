function returnResult() {

    var name = document.name_form.text2.value;
    var res = document.getElementById("returned_result");

    db.collection("gameResult")
    .where("name", "==", name)
    .get()
    .then(function (querySnapshot) {
        querySnapshot.forEach(function(doc) {
            var data = JSON.stringify(doc.data());
            
            res.innerHTML = data;
        });
    
        console.log(querySnapshot);
        
    })
    .catch((error) => {
        console.log(error)
        res.innerHTML = error;
    });

};

function testTable() {
    var tableElem = document.getElementById('resultTable');
    var trElem = tableElem.tBodies[0].insertRow(-1);
    var cellElem = trElem.insertCell(0);
    cellElem.appendChild(document.createTextNode("cell"));

    }

function returnResultTable() {
    var name = document.name_form.text2.value;
    var tableElem = document.getElementById('resultTable');

    db.collection("gameResult")
    .where("name", "==", name)
    .get()
    .then(function (querySnapshot) {
        querySnapshot.forEach(function(doc) {
            var trElem = tableElem.tBodies[0].insertRow(-1);
            var data = JSON.parse(JSON.stringify(doc.data()));
            console.log(data);
            var cellElem0 = trElem.insertCell(0);
            var cellElem1 = trElem.insertCell(1);
            var cellElem2 = trElem.insertCell(2);
            cellElem0.appendChild(document.createTextNode(data.name));
            cellElem1.appendChild(document.createTextNode(data.game));
            cellElem2.appendChild(document.createTextNode(data.point));

        });
    
        console.log(querySnapshot);
        
    })
    .catch((error) => {
        console.log(error)
        res.innerHTML = error;
    });

}