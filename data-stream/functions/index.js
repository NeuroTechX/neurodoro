
const functions = require('firebase-functions');
const bigquery = require("@google-cloud/bigquery")();

/**
 * Triggered from a message on a Cloud Pub/Sub topic.
 *
 */
exports.corvoSamples = functions.pubsub.topic('corvo').onPublish(event => {
  // The Cloud Pub/Sub Message object.
  const pubsubMessage = event.data
  const stringMessage = Buffer.from(pubsubMessage.data, "base64").toString();
  const jsonMessage = JSON.parse(stringMessage);
  console.log(jsonMessage);
  // Our BigQuery dataset
  const dataset = bigquery.dataset("Neurodoro");

  /* ex.
  [{"data":[62.29371885176971,1616.2114883357124,1640.3412688485275,-98.48780410080028],
  "scores":[0,0],"timestamp":151192325762, "uid": 'asfakj2', "session_id": 'asfas12312'}, ... x 768]
  */
  const table = dataset.table("corvo_samples");
  rows = []
  for (var i = 0; i < jsonMessage.length; i++) {
    const row = {
      session_id: jsonMessage[i].session_id,
      user_id: jsonMessage[i].uid,
      timestamp: jsonMessage[i].timestamp,
      difficulty: jsonMessage[i].scores[0],
      performance: jsonMessage[i].scores[1],
      channel_1: jsonMessage[i].data[0],
      channel_2: jsonMessage[i].data[1],
      channel_3: jsonMessage[i].data[2],
      channel_4: jsonMessage[i].data[3]
    };
    rows.push(row)
  }

  // Insert array of rows
  return table.insert(rows).then(
      function(success) {
        console.log('Insert Success')
      },
      function(err) {
        if (err.name === 'PartialFailureError') {
            console.log(err);
            console.log(err.errors[0].row);
            console.log(err.errors[0].errors[0].reason);
            console.log(err.errors[0].errors[0].message);
          } else {
            console.log(err);
          }
      }
    );
});
