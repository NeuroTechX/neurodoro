import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Picker,
} from 'react-native';
import{
  Actions,
}from 'react-native-router-flux';
import { connect } from 'react-redux';
import Button from '../components/Button';
import { MediaQueryStyleSheet} from 'react-native-responsive';
import config from '../redux/config';
import * as colors from '../styles/colors';

// Modules for bridged Java methods
import TensorFlowModule from '../modules/TensorFlow';
import MuseRecorder from '../modules/MuseRecorder';

// Sets isVisible prop by comparing state.scene.key (active scene) to the key of the wrapped scene
function  mapStateToProps(state) {
  return {
    connectionStatus: state.connectionStatus,
  };
}

class Timer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataType: config.dataType.DENOISED_PSD,
    }
  }

  render() {
    return (
      <View style={styles.container}>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Help Us Collect Training Data</Text>
          <Text style={styles.body}>Data sent to Neurodoro database</Text>
        </View>
        <View style={styles.spacerContainer}>
          <View style={{flexDirection: 'row', alignItems:'center'}}>
            <Text style={styles.body}>Data type:</Text>
            <Picker
              style={styles.picker}
              selectedValue={this.state.dataType}
              onValueChange={(type) => this.setState({dataType: type})}>
              <Picker.Item label="Denoised PSD" value={config.dataType.DENOISED_PSD}/>
              <Picker.Item label="Raw EEG" value={config.dataType.RAW_EEG}/>
              <Picker.Item label="Filtered EEG" value={config.dataType.FILTERED_EEG}/>
            </Picker>
          </View>
          <Button onPress={() => MuseRecorder.startRecording(this.state.dataType)}>Start recording</Button>
          <Button onPress={() => MuseRecorder.sendTaskInfo(5 , 4)}>Send test info</Button>
        </View>
        <View style={styles.buttonContainer}>
          <Button onPress={() => MuseRecorder.stopRecording()}>Stop recording</Button>
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
      flex: 1,
      justifyContent: 'center',
    },

    spacerContainer: {
      alignItems: 'center',
      justifyContent: 'space-around',
      flex: 2,
    },

    buttonContainer: {
      justifyContent: 'center',
      flex: 1,
    },

    logo: {
      width: 200,
      height: 200,
    },

    picker: {
      width: 175,
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