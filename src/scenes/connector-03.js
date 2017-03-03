import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import{
  Actions,
}from 'react-native-router-flux';
import { connect } from 'react-redux';
import { MediaQueryStyleSheet }  from 'react-native-responsive';

// Components. For JS UI elements
import WhiteButton from '../components/WhiteButton';

 export default class ConnectorThree extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.titleBox}>
          <Text style={styles.title}>Step 3</Text>
          <Text style={styles.instructions}>Make sure the Muse is properly fit to your head</Text>
          <Text style={styles.body}>Fit the earpieces snugly behind your ears and adjust the headband so that it rests mid forehead. Clear any hair that might prevent the device from making contact with your skin.</Text>
        </View>

        <View style={styles.buttonContainer}>
          <WhiteButton onPress={Actions.Timer}>GO TO TIMER</WhiteButton>
        </View>
      </View>
    );
  }
}

const styles = MediaQueryStyleSheet.create(
  // Base styles
  {
    body: {
      fontFamily: 'Roboto-Light',
      fontSize: 15,
      marginLeft: 40,
      marginRight: 40,
      color: '#ff6347',
      textAlign: 'center'
    },

    instructions: {
      fontFamily: 'Roboto-Bold',
      fontSize: 18,
      margin: 20,
      color: '#ff6347',
      textAlign: 'center',
    },

    container: {
      flex: 1,
      justifyContent: 'space-around',
      alignItems: 'stretch',
      width: null,
      height: null,
      backgroundColor: '#ffffff',
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
      },

      instructions: {
        fontSize: 30
      },
    }
  }
);