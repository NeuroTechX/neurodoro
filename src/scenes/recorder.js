import React, { Component } from "react";
import { WebView, Text, View, Picker, Dimensions } from "react-native";
import { connect } from "react-redux";
import _ from "lodash";
import { MediaQueryStyleSheet } from "react-native-responsive";
import Button from "../components/Button";
import config from "../redux/config";
import * as colors from "../styles/colors";

// Modules for bridged Java methods
//import TensorFlowModule from '../modules/TensorFlow';
import MuseRecorder from "../modules/MuseRecorder";

// Sets isVisible prop by comparing state.scene.key (active scene) to the key of the wrapped scene
function mapStateToProps(state) {
  return {
    connectionStatus: state.connectionStatus
  };
}

const width = Dimensions.get("window").width;

class Recorder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataType: config.dataType.RAW_EEG,
      userName: "",
      isRecording: false
    };
  }

  renderRecordingButton() {
    if (this.state.isRecording) {
      return (
        <Button
          onPress={() => {
            this.setState({ isRecording: false });
            MuseRecorder.stopRecording();
          }}
        >
          Stop recording
        </Button>
      );
    }
    return (
      <Button
        onPress={() => {
          this.setState({ isRecording: true });
          MuseRecorder.startRecording(this.state.dataType);
        }}
      >
        Start recording
      </Button>
    );
  }

  onMessage = event => {
    console.log(event.nativeEvent.data)
    let difficulty = Number(event.nativeEvent.data.split("&")[0].substring(2));
    let performance = Number(event.nativeEvent.data.split("&")[1].substring(2));
    if (_.isNaN(difficulty)) {
      difficulty = 0;
    }
    if (_.isNaN(performance)) {
      performance = 0;
    }
    if (this.state.isRecording) {
      MuseRecorder.sendTaskInfo(difficulty, performance);
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.webviewContainer}>
          <WebView
            source={{ uri: "https://daos-84628.firebaseapp.com" }}
            style={{ width: width, backgroundColor: "black" }}
            scalesPageToFit={true}
            onMessage={this.onMessage}
            javaScriptEnabled={true}
            domStorageEnabled={false}
          />
        </View>
        <View style={styles.buttonContainer}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.body}>Data type:</Text>
            <Picker
              style={styles.picker}
              selectedValue={this.state.dataType}
              onValueChange={type => this.setState({ dataType: type })}
            >
              <Picker.Item
                label="Denoised PSD"
                value={config.dataType.DENOISED_PSD}
              />
              <Picker.Item label="Raw EEG" value={config.dataType.RAW_EEG} />
              <Picker.Item
                label="Filtered EEG"
                value={config.dataType.FILTERED_EEG}
              />
            </Picker>
          </View>
          <View
            style={{
              alignItems: "center"
            }}
          >
            {this.renderRecordingButton()}
          </View>
        </View>
      </View>
    );
  }
}

export default connect(mapStateToProps)(Recorder);

const styles = MediaQueryStyleSheet.create(
  {
    // Base styles
    body: {
      fontFamily: "OpenSans-Regular",
      fontSize: 12,
      color: colors.grey,
      textAlign: "center"
    },

    title: {
      textAlign: "center",
      margin: 15,
      lineHeight: 50,
      color: colors.tomato,
      fontFamily: "YanoneKaffeesatz-Regular",
      fontSize: 50
    },

    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center"
    },

    titleContainer: {
      flex: 1,
      justifyContent: "center"
    },

    webviewContainer: {
      backgroundColor: "purple",
      alignItems: "center",
      justifyContent: "center",
      flex: 3
    },

    buttonContainer: {
      justifyContent: "center",
      flex: 1
    },

    logo: {
      width: 200,
      height: 200
    },

    picker: {
      width: 175
    }
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
  }
);
