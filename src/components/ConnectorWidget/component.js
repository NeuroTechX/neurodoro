// ConnectorWidget.js
// An interface component with a picker and two buttons that handles connection to Muse devices
import React, { Component } from 'react';
import {
  Text,
  View,
  DeviceEventEmitter,
  StyleSheet,
  PermissionsAndroid
} from 'react-native';
import * as colors from '../../styles/colors';
import Button from '../Button';

import config from '../../redux/config'

import Connector from '../../modules/Connector';

export default class ConnectorWidget extends Component {
  constructor(props) {
    super(props);

    this.state = {
      listeners: [],
    };
  }

  async requestLocationPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        {
          'title': 'Neurodoro needs your permission',
          'message': 'This app requires coarse location permission in order to discover and connect to the 2016 Muse'
        }
      );
      if (granted) {
        console.log("Coarse Location granted")
      } else {
        console.log("Coarse Location denied")
      }
      // Whether permission is granted or not, connection proceeds in case user is using first gen device
      this.startConnector();
    } catch (err) {
      console.warn(err)
    }
  }

  startConnector() {
    // This listner will update connection status if no Muses are found in getMuses call
    const noMuseListener = DeviceEventEmitter.addListener('NO_MUSES', (event) => {
      this.props.setConnectionStatus(config.connectionStatus.NO_MUSES);
    });

    // This listener will detect when the connector module enters the temporary 'connecting...' state
    const connectionListener = DeviceEventEmitter.addListener('CONNECT_ATTEMPT', (event) => {
      this.props.setConnectionStatus(config.connectionStatus.CONNECTING);
    });

    this.setState({listeners: [noMuseListener, connectionListener]});
    this.props.getAndConnectToDevice();
  }

  // request location permissions and call getAndConnectToDevice and register event listeners when component loads
  componentDidMount() {
    this.requestLocationPermission();
  }

  componentWillUnmount() {
    this.state.listeners.forEach((listener) => listener.remove());
    Connector.stopConnector();
  }




	render() {

    // switch could also further functionality to handle multiple connection conditions
    switch(this.props.connectionStatus) {
      case config.connectionStatus.CONNECTED:
        connectionString = 'Connected';
        dynamicTextStyle = styles.connected;
        break;
      case config.connectionStatus.NO_MUSES:
        dynamicTextStyle = styles.noMuses;
        return(
          <View style={styles.textContainer}>
            <Button onPress={()=>this.props.getAndConnectToDevice()}>Search Again</Button>
          </View>
        );
      case config.connectionStatus.CONNECTING:
        connectionString = 'Connecting...'
        dynamicTextStyle = styles.connecting;
        break;
      case config.connectionStatus.DISCONNECTED:
        connectionString = 'Searching for Muses...'
        dynamicTextStyle = styles.disconnected;
    }

		return(
				<View style={styles.textContainer}>
					<Text style={dynamicTextStyle}>{connectionString}</Text>
				</View>
		)
	}
};

const styles = StyleSheet.create({

  textContainer: {
    marginTop: 40,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  connected: {
    fontFamily: 'OpenSans-Regular',
    fontSize: 22,
    color: colors.green,
    textAlign: 'center'
  },

 	disconnected: {
    fontFamily: 'OpenSans-Regular',
    fontSize: 22,
 		color: colors.lightGrey,
    textAlign: 'center',
 	},

  connecting: {
    fontFamily: 'OpenSans-Regular',
    fontSize: 22,
    color: colors.tomato,
  }


});






