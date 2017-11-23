 "use strict";

 import PubSubPublisher from '../modules/PubSubPublisher';

class GCPlient {
  constructor(name) {
    this._name = name;
  }

  connect(callback) {
    console.log("connect");
  }

  disconnect(callback) {
    console.log("disconnect");
  }

  getConnected() {
    return false;
  }

  publish(sessionData) {
    console.log("publish");
    PubSubPublisher.setSessionData(sessionData);
    PubSubPublisher.start();
  }

  stop() {
    PubSubPublisher.stop();
    PubSubPublisher.close();
  }

  /**
     *
     * @param routingKey (string)
     * @param callback (function) signature: callback(chunk)
     *  Where 'chunk' is an object:
     *  {
     *    'chunk': [
     *      {
     *        'data': [<float>, ..., <float>],
     *       'timestamp': <int>
     *      },
     *       ...
     *      {
     *       'data': [<float>, ..., <float>],
     *       'timestamp': <int>
     *      }
     *    ]
     *  }
     **/

  subscribe(routingKey, callback) {
    console.log("subscribe");
  }
}

export default GCPlient;

export function generateChunk(samplingRate) {
  samplingRate = samplingRate || 250;

  let chunk = { chunk: [] };

  for (let t = 0; t < samplingRate; t++) {
    const sample = {
      timestamp: `fake-time-${t}`,
      data: [Math.random(), Math.random(), Math.random(), Math.random()]
    };
    chunk.chunk.push(sample);
  }
  return chunk;
}
