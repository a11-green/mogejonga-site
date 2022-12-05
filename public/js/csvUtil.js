function displayTable(year) {
    dfd.readCSV(`https://raw.githubusercontent.com/a11-green/mogejonga-site/main/db/csv/data${year}.csv`)
    .then(df => {
        df.plot("table").table();

        const layout = {
            title: "Point History",
            xaxis: {
                title: "X",
            },
            yaxis: {
                title: "Y",
            },
        };

        const config = {
            columns: ["point"],
        };
        df.query(df["name"].eq("浅野")).setIndex({ column: "game" }).plot("history").line({layout, config});
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
        };

        const config = {
            columns: ["cumsum"],
        };
        df.query(df["name"].eq("浅野")).setIndex({ column: "game" }).plot("history").line({layout, config});
    })
}

