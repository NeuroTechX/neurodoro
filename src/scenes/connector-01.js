import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import{
  Actions,
}from 'react-native-router-flux';
import * as colors from '../styles/colors';

import { MediaQueryStyleSheet }  from 'react-native-responsive';

// Components. For JS UI elements
import Button from '../components/Button';

 export default class ConnectorOne extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Step 1</Text>
          <Text style={styles.body}>Make sure your {'\n'} Muse is powered on</Text>
        </View>
        <View style={styles.spacerContainer}/>
        <View style={styles.buttonContainer}>
          <Button onPress={Actions.ConnectorTwo}>Okay</Button>
        </View>
      </View>
    );
  }
 }

const styles = MediaQueryStyleSheet.create(
  {
    // Base styles
    body: {
      fontFamily: 'OpenSans-Regular',
      fontSize: 25,
      color: colors.grey,
      textAlign: 'center'
    },

    title: {
      textAlign: 'center',
      margin: 15,
      lineHeight: 50,
      color: colors.tomato,
      fontFamily: 'YanoneKaffeesatz-Regular',
      fontSize: 50,
    },

    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      margin: 50,
    },

    titleContainer: {
      flex: 2,
      justifyContent: 'center',
    },

    spacerContainer: {
      justifyContent: 'center',
      flex: 1,
    },

    buttonContainer: {
      justifyContent: 'center',
      flex: 1,
    },

    logo: {
      width: 200,
      height: 200,
    },
  },
  // Responsive styles
  {
    "@media (min-device-height: 700)": {
      body: {
        fontSize: 30,
        marginLeft: 50,
        marginRight: 50
      }
    }
  });