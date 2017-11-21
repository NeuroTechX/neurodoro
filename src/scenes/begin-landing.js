import React, { Component } from "react";
import { Text, View, Image, StatusBar, Alert } from "react-native";
import { Actions } from "react-native-router-flux";
import { MediaQueryStyleSheet } from "react-native-responsive";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { connectAndGo } from "../redux/actions";
import * as colors from "../styles/colors";
import config from "../redux/config";

// Components. For JS UI elements
import BigButton from "../components/BigButton";
import WhiteButton from "../components/WhiteButton";

function mapStateToProps(state) {
  return {
    destination: state.destination,
    connectionStatus: state.connectionStatus
  };
}

// Binds actions to component's props
function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      connectAndGo
    },
    dispatch
  );
}

class Landing extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <View style={styles.container} resizeMode="stretch">
        <StatusBar backgroundColor={colors.tomato} />
        <View style={styles.titleContainer}>
          <Image
            source={require("../assets/logo_final.png")}
            style={styles.logo}
            resizeMode="stretch"
          />
          <Text style={styles.title}>NEURODORO</Text>
        </View>
        <View style={styles.buttonContainer}>
          <BigButton
            fontSize={25}
            onPress={() => {
              if (
                this.props.connectionStatus == config.connectionStatus.CONNECTED
              ) {
                Actions.Timer;
              } else {
                Alert.alert(
                  "You down with EEG?",
                  "Would you like to use the Muse to try and recommend when to take a break?",
                  [
                    {
                      text: "No EEG, just the timer",
                      onPress: Actions.Timer
                    },
                    {
                      text: "OK",
                      onPress: () => this.props.connectAndGo("TIMER")
                    }
                  ],
                  { cancelable: true }
                );
              }
            }}
          >
            Use the timer
          </BigButton>
          <WhiteButton onPress={Actions.DataLanding}>
            Collect data{" "}
            <Image
              source={require("../assets/beaker2.png")}
              style={styles.beaker}
              resizeMode="stretch"
            />
          </WhiteButton>
        </View>
      </View>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Landing);

const styles = MediaQueryStyleSheet.create(
  {
    // Base styles
    body: {
      fontFamily: "OpenSans-Regular",
      fontSize: 15,
      margin: 20,
      color: colors.grey,
      textAlign: "center"
    },

    title: {
      textAlign: "center",
      margin: 15,
      lineHeight: 50,
      color: colors.grey,
      fontFamily: "YanoneKaffeesatz-Regular",
      fontSize: 50
    },

    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      margin: 50
    },

    titleContainer: {
      flex: 2,
      justifyContent: "flex-start"
    },

    spacerContainer: {
      justifyContent: "center",
      flex: 1
    },

    buttonContainer: {
      justifyContent: "space-between",
      flex: 1.5
    },

    logo: {
      width: 200,
      height: 200
    },

    beaker: {
      width: 55,
      height: 55
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
