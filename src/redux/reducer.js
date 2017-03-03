// reducer.js
// Our Redux reducer. Handles the routing actions produced by react-native-router-flux as well as Muse connection actions

import { ActionConst } from 'react-native-router-flux';
import config from './config';
import {
  SET_CONNECTION_STATUS,
} from './constants';

const initialState = {
  connectionStatus: config.connectionStatus.DISCONNECTED,
  availableMuses: false,
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    // focus action is dispatched when a new screen comes into focus
    case ActionConst.FOCUS:

      return {
        ...state,
        scene: action.scene
      };

    case SET_CONNECTION_STATUS:

      return {
        ...state,
        connectionStatus: action.payload
      };

    // ...other actions

    default:
      return state;
  }
}
