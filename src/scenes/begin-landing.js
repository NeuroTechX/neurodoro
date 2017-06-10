import React, { Component } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  Image,
  StatusBar
} from 'react-native';
import{
  Actions,
}from 'react-native-router-flux';
import { MediaQueryStyleSheet } from 'react-native-responsive';
import * as colors from '../styles/colors';


// Components. For JS UI elements
import Button from '../components/Button';

export default class Landing extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <View style={styles.container} resizeMode='stretch'>
        <StatusBar backgroundColor={colors.tomato}/>
        <View style={styles.titleContainer}>
          <Image source={require('../assets/logo_final.png')} style={styles.logo} resizeMode='stretch'/>
          <Text style={styles.title}>NEURODORO</Text>
        </View>
        <View style={styles.spacerContainer}/>
        <View style={styles.buttonContainer}>
          <Button onPress={Actions.Timer}>Use the timer</Button>
          <Button onPress={Actions.ConnectorOne}>Collect data</Button>
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
      fontSize: 15,
      margin: 20,
      color: colors.grey,
      textAlign: 'center'
    },

    title: {
      textAlign: 'center',
      margin: 15,
      lineHeight: 50,
      color: colors.grey,
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
      justifyContent: 'flex-start',
    },

    spacerContainer: {
      justifyContent: 'center',
      flex: 1,
    },

    buttonContainer: {
      justifyContent: 'space-between',
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
