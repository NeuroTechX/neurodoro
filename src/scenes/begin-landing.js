import React, { Component } from "react";
import { Text, View, Image, StatusBar, Modal } from "react-native";
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
import Button from "../components/Button";

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
    this.state = {
      isPopupVisible: false
    };
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
          <Text style={styles.title}>
            NEURODORO <Text style={styles.beta}>BETA</Text>
          </Text>
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
                this.setState({
                  isPopupVisible: true
                });
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
        <Modal
          animationType={"fade"}
          transparent={true}
          onRequestClose={() => this.setState({ isPopupVisible: false })}
          visible={this.state.isPopupVisible}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalInnerContainer}>
              <Text style={styles.modalTitle}>Use EEG?</Text>
              <Text style={styles.modalText}>
                Would you like to use the Muse to track concentration and
                recommend when to take a break?
              </Text>
              <View style={{ flexDirection: "row", alignSelf: 'center' }}>
                <Button onPress={() => {
                  this.setState({ isPopupVisible: false });
                  this.props.connectAndGo("TIMER");
                }}>
                  Ok
                </Button>
                <Button onPress={()=> {
                  this.setState({ isPopupVisible: false });
                  Actions.Timer();
                }}>No</Button>
              </View>
            </View>
          </View>
        </Modal>
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

    beta: {
      color: colors.tomato
    },

    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      margin: 50
    },

    titleContainer: {
      flex: 2,
      justifyContent: "flex-start",
      alignItems: "center"
    },

    spacerContainer: {
      justifyContent: "center",
      flex: 1
    },

    buttonContainer: {
      justifyContent: "space-between",
      flex: 1
    },

    logo: {
      width: 200,
      height: 200
    },

    beaker: {
      width: 55,
      height: 55
    },

    modalBackground: {
      flex: 1,
      justifyContent: "center",
      alignItems: "stretch",
      padding: 20,
      backgroundColor: colors.tomato
    },

    modalText: {
      fontFamily: "OpenSans-Regular'",
      color: colors.black,
      fontSize: 15,
      margin: 5
    },

    modalTitle: {
      fontFamily: "OpenSans-Bold",
      color: colors.black,
      fontSize: 20,
      margin: 5
    },

    modalInnerContainer: {
      alignItems: "stretch",
      backgroundColor: colors.white,
      padding: 20,
      elevation: 5,
      borderRadius: 4
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
