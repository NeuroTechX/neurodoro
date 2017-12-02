const bigquery = require("@google-cloud/bigquery")();

const dataset = bigquery.dataset("Neurodoro");

const samples = dataset.table('corvo_samples');

rows = samples
    .query("SELECT * FROM corvo_samples LIMIT 10")
    .then((results) =>{
        console.log(results)
})

