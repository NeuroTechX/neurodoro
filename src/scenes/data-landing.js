import React, { Component } from "react";
import { Text, View } from "react-native";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { MediaQueryStyleSheet } from "react-native-responsive";
import Button from "../components/Button";
import PubSubClient from "../pub_sub_clients/GCPClient";
import config from "../redux/config";
import { updatePubSubClient, connectAndGo } from "../redux/actions";
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

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      updatePubSubClient: updatePubSubClient,
      connectAndGo: connectAndGo
    },
    dispatch
  );
}

class DataCollection extends Component {
  constructor(props) {
    super(props);
    this.initializePubSubClient(props);
    this.state = {
      dataType: config.dataType.RAW_EEG,
      isRecording: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.pubSubClient &&
      this.props.pubSubClient._name != nextProps.pubSubClient._name
    ) {
      this.initializePubSubClient(nextProps);
    }
  }

  initializePubSubClient = props => {
    const pubSubClient = new PubSubClient("CORVO");
    this.props.updatePubSubClient(pubSubClient);
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Collecting Data for Neurodoro</Text>
          <Text style={styles.body}>
            With Neurodoro, we're hoping to create an effective classifier for
            attention that can be used to organize work, give feedback, and
            enhance productivity.
          </Text>

          <Text style={styles.body}>
            In order to create something that works for everyone we need a lot
            of data. So, we've designed an attention-based cognitive test that
            with a Muse to help us gather data. Your test scores and EEG data
            will be uploaded to our open-source database and put through maching
            learning algorithms to identify neural signatures of high cognitive
            performance
          </Text>

          <Text style={styles.body}>
            Neurodoro is still in development and unfortunately we are not able
            to provide encryption or security for our user's EEG data.
          </Text>

          <Text style={styles.body}>
            By proceeding, you agree that we may have full access to data
            collected from these sessions, including the right to share. Besides
            a token that links your sessions to this phone no personal
            information will be collected
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <Button onPress={() => this.props.connectAndGo("CORVO")}>OK</Button>
        </View>
      </View>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DataCollection);

const styles = MediaQueryStyleSheet.create(
  {
    // Base styles
    body: {
      fontFamily: "OpenSans-Regular",
      fontSize: 14,
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
      alignItems: "center"
    },

    buttonContainer: {
      justifyContent: "flex-start",
      flex: 1
    },

    textContainer: {
      justifyContent: "center",
      flex: 4
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
