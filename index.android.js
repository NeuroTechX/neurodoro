import React, { Component } from 'react';
import {
  AppRegistry,
  DeviceEventEmitter,
} from 'react-native';
import{
  Router,
  Scene,
}from 'react-native-router-flux';
import{ Provider, connect }from 'react-redux';
import{ createStore, applyMiddleware }from 'redux';
import thunk from 'redux-thunk';
import config from './src/redux/config';
import { setConnectionStatus } from './src/redux/actions';

//  Scenes
import Landing from './src/scenes/begin-landing';
import ConnectorOne from './src/scenes/connector-01';
import ConnectorTwo from './src/scenes/connector-02';
import ConnectorThree from './src/scenes/connector-03';
import Timer from './src/scenes/timer';
import DataLanding from './src/scenes/data-landing';
import CORVOTest from './src/scenes/corvo-test';
import DataSummary from './src/scenes/data-summary';

// reducer is a function
import reducer from './src/redux/reducer';

// Connect Router to Redux
const RouterWithRedux = connect()(Router);

// Create store
const store = createStore(reducer, applyMiddleware(thunk));

export default class Neurodoro extends Component {


  componentDidMount() {
    // This creates a persistent listener that will update connectionStatus when connection events are broadcast in Java
    DeviceEventEmitter.addListener('DISCONNECTED', (event) => {
      store.dispatch(setConnectionStatus(config.connectionStatus.DISCONNECTED));
    });

    DeviceEventEmitter.addListener('CONNECTED', (event) => {
      store.dispatch(setConnectionStatus(config.connectionStatus.CONNECTED));
    });
  }


  render() {
    return (
      <Provider store={store}>
        <RouterWithRedux>
          <Scene key="root" >
            <Scene component={Landing} key='Landing' initial={true} hideNavBar={true}/>
            <Scene component={ConnectorOne} key='ConnectorOne' hideNavBar={true}/>
            <Scene component={ConnectorTwo} key='ConnectorTwo' hideNavBar={true}/>
            <Scene component={ConnectorThree} key='ConnectorThree' hideNavBar={true}/>
            <Scene component={Timer} key='Timer' hideNavBar={true}/>
            <Scene component={DataLanding} key='DataLanding' hideNavBar={true}/>
            <Scene component={CORVOTest} key='CORVOTest' hideNavBar={true}/>
            <Scene component={DataSummary} key='DataSummary' hideNavBar={true}/>
          </Scene>
        </RouterWithRedux>
      </Provider>
    );
  }
}

// Defines which component is the root for the whole project
AppRegistry.registerComponent('Neurodoro', () => Neurodoro);
