import React, { Component } from "react";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  ViewPagerAndroid,
  Linking
} from "react-native";
import { connect } from "react-redux";
import { Actions } from "react-native-router-flux";
import _ from "lodash";
import { MediaQueryStyleSheet } from "react-native-responsive";
import Button from "../components/Button";
import MuseRecorder from "../modules/MuseRecorder";
import PubSubClient from "../pub_sub_clients/GCPClient";
import config from "../redux/config";
import actions from "../redux/actions";
import * as colors from "../styles/colors";

// Modules for bridged Java methods
//import TensorFlowModule from '../modules/TensorFlow';

// Sets isVisible prop by comparing state.scene.key (active scene) to the key of the wrapped scene
function mapStateToProps(state) {
  return {
    connectionStatus: state.connectionStatus,
    session: state.session,
    pubSubClient: state.pubSubClient
  };
}

class DataSummary extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount(props) {
    this.finishRecording();
  }

  finishRecording() {
    MuseRecorder.stopRecording;
    MuseRecorder.getCORVOSession(
      msg => {
        console.log(msg);
        //this.props.getCORVOsession(msg);
      },
      msg => {
        console.log(msg);
        //this.props.getCORVOsession(msg);
      }
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            Thanks for Contributing to Neurodoro!
          </Text>
          <Text style={styles.body}>
            With your data we'll hopefully be able to create the best free,
            brain-sensing productivity tool the world has ever seen!
          </Text>
          <Text style={styles.body}>
            You can follow our progress or get involved yourself on GitHub and
            the NeuroTechX Slack. We're currently looking for JS developers,
            data/AI scientists, and UX designers interested in joining this fun
            little side project.
          </Text>
        </View>
        <View style={styles.logoBox}>
          <TouchableOpacity
            onPress={() => {
              Linking.openURL("https://github.com/NeuroTechX/eeg-101");
            }}
          >
            <Image
              source={require("../assets/gitlogo.png")}
              resizeMode="contain"
              style={styles.logo}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Linking.openURL("https://neurotechx.herokuapp.com/");
            }}
          >
            <Image
              source={require("../assets/slacklogowhite.png")}
              resizeMode="contain"
              style={styles.logo}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <Button onPress={Actions.CORVOTest}>Re-take Test</Button>
          <Button onPress={Actions.Landing}>Back Home</Button>
        </View>
      </View>
    );
  }
}

export default connect(mapStateToProps)(DataSummary);

const styles = MediaQueryStyleSheet.create(
  {
    // Base styles
    body: {
      fontFamily: "OpenSans-Regular",
      fontSize: 18,
      marginLeft: 15,
      margin: 5,
      marginRight: 15,
      color: colors.grey,
      textAlign: "center"
    },

    title: {
      textAlign: "center",
      margin: 10,
      color: colors.tomato,
      fontFamily: "YanoneKaffeesatz-Regular",
      fontSize: 30
    },

    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "stretch"
    },

    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      flex: 1
    },

    textContainer: {
      justifyContent: "center",
      flex: 4
    },

    logoBox: {
      borderRadius: 20,
      alignSelf: 'center',
      opacity: 1,
      width: 200,
      marginBottom: 100,
      marginTop: 0,
      flex: 0.5,
      backgroundColor: colors.tomato,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around"
    },

    logo: {
      width: 60,
      height: 40
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
