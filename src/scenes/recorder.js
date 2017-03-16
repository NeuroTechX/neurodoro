import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';
import{
  Actions,
}from 'react-native-router-flux';
import { connect } from 'react-redux';
import config from '../redux/config';
import Button from '../components/Button';
import { MediaQueryStyleSheet} from 'react-native-responsive';
import * as colors from '../styles/colors';

// Modules for bridged Java methods
import TensorFlowModule from '../modules/TensorFlow';
import MuseListener from '../modules/MuseListener';

// Sets isVisible prop by comparing state.scene.key (active scene) to the key of the wrapped scene
function  mapStateToProps(state) {
  return {
    connectionStatus: state.connectionStatus,
  };
}

class Timer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.container}>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Temporary Classifier Testing Data Collection Screen</Text>
          <Text style={styles.body}>Data stored as .csv in /Main Storage/Android/data/com.neurodoro/files/Download</Text>
        </View>
        <View style={styles.spacerContainer}>
          <Button onPress={() => MuseListener.startListening()}>Start recording</Button>
        </View>
        <View style={styles.buttonContainer}>
          <Button onPress={() => MuseListener.stopListening()}>Stop recording</Button>
        </View>
      </View>
    );
  }
}

export default connect(mapStateToProps)(Timer);


const styles = MediaQueryStyleSheet.create(
  {
    // Base styles
    body: {
      fontFamily: 'OpenSans-Regular',
      fontSize: 12,
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
      flex: 3,
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