import React, { Component } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import{
  Actions,
}from 'react-native-router-flux';
import { MediaQueryStyleSheet } from 'react-native-responsive';


// Components. For JS UI elements
import WhiteButton from '../components/WhiteButton';

export default class Landing extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }


  render() {
    return (
      <View style={styles.container} resizeMode='stretch'>

        <View style={styles.titleBox}>
          <Text style={styles.title}>NEURODORO</Text>
          <Text style={styles.body}>A brain-sensing Pomodoro Timer</Text>
        </View>
        <View style={styles.buttonContainer}>
          <WhiteButton onPress={Actions.ConnectorOne}>GET STARTED</WhiteButton>
        </View>
      </View>
    );
  }

}

const styles = MediaQueryStyleSheet.create(
  {
    // Base styles
    body: {
      fontFamily: 'Roboto-Light',
      fontSize: 15,
      margin: 20,
      color: '#ff6347',
      textAlign: 'center'
    },

    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'stretch',
      width: null,
      height: null,
      backgroundColor: 'rgba(0,0,0,0)'
    },

    buttonContainer: {
      flex: 1,
      margin: 40,
      justifyContent: 'center',
    },

    logo: {
      width: 50,
      height: 50,
    },

    title: {
      textAlign: 'center',
      margin: 15,
      lineHeight: 50,
      color: '#ff6347',
      fontFamily: 'Roboto-Black',
      fontSize: 48,
    },

    titleBox: {
      flex: 4,
      alignItems: 'center',
      justifyContent: 'center',
    },
  },
  // Responsive styles
  {
    "@media (min-device-height: 700)": {
      body: {
        fontSize: 20,
        marginLeft: 50,
        marginRight: 50
      }
    }
  });