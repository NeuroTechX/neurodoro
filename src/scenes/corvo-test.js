// Our beloved CORVO test, running on it's own in a cute little WebView component

import React, { Component } from "react";
import { View, WebView, Dimensions } from "react-native";
import { MediaQueryStyleSheet } from "react-native-responsive";
import { Actions } from "react-native-router-flux";
import { connect } from "react-redux";
import _ from "lodash";
import { bindActionCreators } from "redux";
import Button from "../components/Button";
import BigButton from "../components/BigButton";
import * as colors from "../styles/colors";

// Modules for bridged Java methods
//import TensorFlowModule from '../modules/TensorFlow';
import MuseRecorder from "../modules/MuseRecorder";

const width = Dimensions.get("window").width;

function mapStateToProps(state) {
  return {
    destination: state.destination,
    connectionStatus: state.connectionStatus
  };
}

// Binds actions to component's props
function mapDispatchToProps(dispatch) {
  return bindActionCreators({}, dispatch);
}

class CORVOTest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataType: "rawEEG",
      isRecording: false
    };
  }

  onMessage = event => {
    console.log(event.nativeEvent.data);
    let difficulty = Number(event.nativeEvent.data.split("&")[0].substring(2));
    let performance = Number(event.nativeEvent.data.split("&")[1].substring(2));
    if (_.isNaN(difficulty)) {
      difficulty = 0;
    }
    if (_.isNaN(performance)) {
      performance = 0;
    }
    if (this.state.isRecording) {
      MuseRecorder.updateScore(difficulty, performance);
    }
  };


  render() {
    if (this.state.isRecording) {
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
            <Button onPress={Actions.DataSummary}>End Test</Button>
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.container}>
          <BigButton
            onPress={() => {
              this.setState({ isRecording: true });
              // TODO: Make CORVO squirt a testType into here
              MuseRecorder.startRecording(
                this.state.dataType,
                "non-symbolic attention"
              );
            }}
          >
            Start
          </BigButton>
        </View>
      );
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CORVOTest);

const styles = MediaQueryStyleSheet.create(
  {
    // Base styles
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
    }
  },
  // Responsive styles
  {
    "@media (min-device-height: 700)": {
      active: {
        marginLeft: 20,
        marginRight: 20
      },
      disabled: {
        marginLeft: 20,
        marginRight: 20
      }
    }
  }
);
