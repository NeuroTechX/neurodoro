"use strict";

class GCPlient {
  constructor(vhost, idToken, bufferSize) {
    this._vhost = vhost;
    this._idToken = idToken;
    this._username = `${this._vhost}:${this._idToken}`;
    this._password = "JWT";
    this._host = RABBITMQ_DOMAIN;
    this._port = 12345;
    this._url = `https://${this._host}:${this._port}/ws`;
    this._client = mqtt.connect(this._url, {
      username: this._username,
      password: this._password,
      protocol: "mqtts"
    });
    this.bufferSize = bufferSize || 10;
    this.buffer = [];
    this._connected = false;
  }

  connect(callback) {
    console.log('connect');
  }

  disconnect(callback) {
    console.log('disconnect');
  }

  getConnected() {
    return this._connected;
  }

  publish(routingKey, body) {
    console.log('publish');
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
    console.log('subscribe');
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
