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

    // Initialize States
    this.state = {

    };
  }

  render() {
    return (
      <View style={styles.container}>

        <View style={styles.timerContainer}>
          <Button onPress={() => MuseListener.initListener()}>Init Muse Listeners</Button>
          <Button onPress={() => MuseListener.startListening()}>Start Listening</Button>
          <Button onPress={() => MuseListener.stopListening()}>Stop Listening</Button>
        </View>

      </View>
    );
  }
}

export default connect(mapStateToProps)(Timer);

// Darker: #72C2F1
// Light: #97D2FC
const styles = MediaQueryStyleSheet.create(
  // Base styles
  {

    container: {
      marginTop:55,
      flex: 1,
      justifyContent: 'space-around',
      alignItems: 'stretch',
    },

    container: {
      flex: 1,
      justifyContent: 'space-around',
      alignItems: 'center',
    },

  },
  // Responsive styles
  {
    "@media (min-device-height: 700)": {

    }
  });