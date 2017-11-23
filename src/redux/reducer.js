// reducer.js
// Our Redux reducer. Handles the routing actions produced by react-native-router-flux as well as Muse connection actions

import config from './config';
import {
  SET_CONNECTION_STATUS,
  SET_MUSE_INFO,
  SET_AVAILABLE_MUSES,
  SET_DESTINATION,
  UPDATE_PUB_SUB_CLIENT
} from './actionTypes';

const initialState = {
  connectionStatus: config.connectionStatus.NOT_YET_CONNECTED,
  availableMuses: [],
  museInfo: {},
  destination: '',
  pubSubClient: null,
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    // focus action is dispatched when a new screen comes into focus

    case SET_CONNECTION_STATUS:
      return {
        ...state,
        connectionStatus: action.payload,
      };

      case SET_AVAILABLE_MUSES:
      return {
        ...state,
        availableMuses: action.payload,
      };

      case SET_MUSE_INFO:
      return {
        ...state,
        museInfo: action.payload,
        isUsingMuse: true
      };

      case SET_DESTINATION:
      console.log('setting destination to ' + action.payload)
      return {
        ...state,
        destination: action.payload
      };

      case UPDATE_PUB_SUB_CLIENT:
      return {
        ...state,
        pubSubClient: action.payload
      };

    // ...other actions

    default:
      return state;
  }
}
