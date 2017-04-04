import React, { Component } from 'react';
import {
  WebView,
  StyleSheet,
  Text,
  View,
  Image,
  Picker,
} from 'react-native';
import{ Actions }from 'react-native-router-flux';
import { connect } from 'react-redux';
import _ from 'lodash';
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

  onMessage = (event) => {
    let difficulty = Number(event.nativeEvent.data.split("&")[0].substring(2));
    let performance = Number(event.nativeEvent.data.split("&")[1].substring(2));
    console.log('difficulty ' + difficulty, ' performance ' + performance);
    if(_.isNaN(difficulty)) {
      console.log('nan detected');
      difficulty = 0;
    }
    MuseRecorder.sendTaskInfo(difficulty , performance);
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.webviewContainer}>
          <WebView
            source={{uri: 'https://daos-84628.firebaseapp.com'}}
            style={{width: 350}}
            onMessage={this.onMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        </View>
        <View style={styles.buttonContainer}>
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
          <View style={{width: 250, flexDirection: 'row', alignItems:'center', justifyContent: 'space-between'}}>
            <Button fontSize={12} onPress={() => MuseRecorder.startRecording(this.state.dataType)}>Start recording</Button>
            <Button fontSize={12} onPress={() => MuseRecorder.stopRecording()}>Stop recording</Button>
          </View>
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
    },

    titleContainer: {
      flex: 1,
      justifyContent: 'center',
    },

    webviewContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 3,

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