const bigquery = require("@google-cloud/bigquery")();


const jsonMessage = [ { data: [ 850.8542245596052, 854.8537936482682, 846.1910850032522, 838.1062235567435 ], scores: [ 11, 67 ], session_id: 'Sjy853402', timestamp: 1512195382250, uid: 'cpwritaSjy8' }, { data: [ 834.2424242848429, 848.672749898567, 843.5384359940723, 832.417752375617 ], scores: [ 11, 67 ], session_id: 'Sjy853402', timestamp: 1512195382250, uid: 'cpwritaSjy8' }, { data: [ 825.7497845569359, 849.1394256774287, 840.1842442110345, 829.5831946697192 ], scores: [ 11, 67 ], session_id: 'Sjy853402', timestamp: 1512195382250, uid: 'cpwritaSjy8' }, { data: [ 841.186002972586, 853.4477516120583, 838.3783627886892, 832.8645542455604 ], scores: [ 11, 67 ], session_id: 'Sjy853402', timestamp: 1512195382250, uid: 'cpwritaSjy8' }, { data: [ 848.3221348394161, 851.5839221383878, 840.6100228950294, 836.3945865887167 ], scores: [ 11, 67 ], session_id: 'Sjy853402', timestamp: 1512195382250, uid: 'cpwritaSjy8' }, { data: [ 827.8320580969171, 850.7928564608085, 835.7951723161872, 829.7899570346823 ], scores: [ 11, 67 ], session_id: 'Sjy853402', timestamp: 1512195382250, uid: 'cpwritaSjy8' }, { data: [ 823.9864871460887, 851.6948721246356, 835.0439759938789, 821.3463264976206 ], scores: [ 11, 67 ], session_id: 'Sjy853402', timestamp: 1512195382251, uid: 'cpwritaSjy8' }, { data: [ 839.5817765317692, 853.1025315031045, 839.9296559364112, 828.4016138774996 ], scores: [ 11, 67 ], session_id: 'Sjy853402', timestamp: 1512195382251, uid: 'cpwritaSjy8' }, { data: [ 844.0080792182822, 852.7005350365783, 841.1805651013038, 840.3273686438595 ], scores: [ 11, 67 ], session_id: 'Sjy853402', timestamp: 1512195382251, uid: 'cpwritaSjy8' }, { data: [ 847.0339234425514, 855.2598786197834, 842.6285554723232, 833.2616806873536 ], scores: [ 11, 67 ], session_id: 'Sjy853402', timestamp: 1512195382251, uid: 'cpwritaSjy8' }, { data: [ 837.003822237315, 860.023451140349, 847.2009098964584, 832.2407999548154 ], scores: [ 11, 67 ], session_id: 'Sjy853402', timestamp: 1512195382251, uid: 'cpwritaSjy8' }, { data: [ 836.8462675906607, 857.4798935026118, 848.6926745593229, 842.5486597404423 ], scores: [ 11, 67 ], session_id: 'Sjy853402', timestamp: 1512195382251, uid: 'cpwritaSjy8' }, { data: [ 853.5084406033563, 851.388305382066, 844.502510331563, 844.7247421784411 ], scores: [ 11, 67 ], session_id: 'Sjy853402', timestamp: 1512195382316, uid: 'cpwritaSjy8' }, { data: [ 846.4691034710131, 850.9096003054578, 840.1956074833134, 842.8227679577396 ], scores: [ 11, 67 ], session_id: 'Sjy853402', timestamp: 1512195382317, uid: 'cpwritaSjy8' }, { data: [ 832.1165141294288, 855.7266871418594, 841.5863822905503, 838.2687985902469 ], scores: [ 11, 67 ], session_id: 'Sjy853402', timestamp: 1512195382317, uid: 'cpwritaSjy8' }, { data: [ 833.9405054376559, 851.7306969605293, 840.3564939037681, 831.749029049104 ], scores: [ 11, 67 ], session_id: 'Sjy853402', timestamp: 1512195382317, uid: 'cpwritaSjy8' }, { data: [ 850.8916980465049, 848.3670149937276, 841.8935924240067, 838.7460570540144 ], scores: [ 11, 67 ], session_id: 'Sjy853402', timestamp: 1512195382317, uid: 'cpwritaSjy8' }, { data: [ 855.1900545413444, 849.3773185741903, 841.4350438446932, 842.1967688629089 ], scores: [ 11, 67 ], session_id: 'Sjy853402', timestamp: 1512195382320, uid: 'cpwritaSjy8' }, { data: [ 843.5234687335428, 847.6132447418827, 841.71570126951, 839.5120077508927 ], scores: [ 11, 67 ], session_id: 'Sjy853402', timestamp: 1512195382320, uid: 'cpwritaSjy8' }, { data: [ 840.010185762009, 850.3344196710948, 847.6932866775841, 844.6884466645088 ], scores: [ 11, 67 ], session_id: 'Sjy853402', timestamp: 1512195382320, uid: 'cpwritaSjy8' }, { data: [ 849.5003653551612, 854.1778484171325, 845.4869959700328, 851.1771773746393 ], scores: [ 11, 67 ], session_id: 'Sjy853402', timestamp: 1512195382320, uid: 'cpwritaSjy8' }, { data: [ 855.6073571716038, 859.4509597431012, 845.5114277167152, 852.8700268263964 ], scores: [ 11, 67 ], session_id: 'Sjy853402', timestamp: 1512195382320, uid: 'cpwritaSjy8' } ]

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
table.insert(rows).then(
    function(success) {
      console.log('Insert Success');
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
