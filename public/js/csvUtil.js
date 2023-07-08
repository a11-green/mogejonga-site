function displayTable(year) {
    dfd.readCSV(`https://raw.githubusercontent.com/a11-green/mogejonga-site/main/db/csv/data${year}.csv`)
    .then(df => {
        const layout = {
            width: 1000,
        };
        df.plot("table").table();
    })
    .catch(err => {
        console.log(err);
    }) 
};



function statsEachYear(year, name) {
    dfd.readCSV(`https://raw.githubusercontent.com/a11-green/mogejonga-site/main/db/csv_new/data${year}_processed.csv`)
    .then(df => {
        const layout = {
            title: "Point History",
            xaxis: {
                title: "Game",
            },
            yaxis: {
                title: "Point",
            },
            height: 300,
            width: 400,
            margin: {
                r:10,
                b:0,
                l:10,
                t:0,
                pad:10
            },
        };

        const config = {
            columns: ["cumsum"],
            // tableHeaderStyle: headerStyle
        };

        var tableElem = document.getElementById('dataTable');
        // Clear Table Rows
        var row = dataTable.rows.length;
        for (let i = 1; i < row; i++){
            tableElem.tBodies[0].deleteRow(-1)
        }
        
        var names = df.groupby(["name"]).keyToValue;
        
        for(let name in names) {
            var df_new = df.query(df["name"].eq(name));
            

            var pointSum = df_new["point"].sum();
            var rankMean = df_new["rank"].mean();
            // var pointsumQ = df_new.query({ column: "status", is: "==", to: "Q"}).sum();

            var trElem = tableElem.tBodies[0].insertRow(-1);
            var cellElem0 = trElem.insertCell(0);
            var cellElem1 = trElem.insertCell(1);
            var cellElem2 = trElem.insertCell(2);
            var cellElem3 = trElem.insertCell(3);
            cellElem0.appendChild(document.createTextNode(name));
            cellElem1.appendChild(document.createTextNode(pointSum.toFixed(1)));
            cellElem2.appendChild(document.createTextNode(rankMean.toFixed(2)));
            // cellElem3.appendChild(document.createTextNode(pointSumQ.toFixed(3)));
        }
        


        // let df_asano_p = df_asano["game", "point"];
        // df_asano_p.set_index({ key: "game" });
        // df_asano_p.plot("history").table();
        // let df_new = df.groupby(["name"]);
        // df_new.plot("history").line({layout, config});
        // let df_new = new dfd.DataFrame(df.query(df["name"].eq("浅野"))["game"], "game");
        // console.log(df_new);
        // var names = df.groupby(["name"]).keyToValue;
        // for(let name in names) {
        //     df_new.addColumn(name, df.query(df["name"].eq(name))["point"], { inplace: true });
        // }
        // df_new.plot("history").line({layout, config});
        // df_new.plot("history").table();
        
    })
}

