// ModalMenu.js
// A popup modal menu

import React, { Component } from "react";
import { Text, View, Modal, Slider, Switch } from "react-native";
import { MediaQueryStyleSheet } from "react-native-responsive";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { setEncouragementEnabled } from "../redux/actions";
import Button from "../components/Button";
import * as colors from "../styles/colors";

function mapStateToProps(state) {
  return {
    encouragementEnabled: state.encouragementEnabled
  };
}

// Binds actions to component's props
function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      setEncouragementEnabled
    },
    dispatch
  );
}

class ModalMenu extends Component {
  constructor(props) {
    super(props);

    this.state = {
      workTime: 25,
      breakTime: 5
    };
  }

  render() {
    return (
      <Modal
        animationType={"fade"}
        transparent={true}
        onRequestClose={() =>
          this.props.onClose(this.state.workTime, this.state.breakTime)}
        visible={this.props.visible}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalInnerContainer}>
            <Text style={styles.modalTitle}>Settings</Text>
            <Text style={styles.modalText}>Set your target work duration:</Text>
            <Text style={styles.modalText}>
              {this.state.workTime}
            </Text>

            <Slider
              maximumValue={60}
              step={1}
              value={this.state.workTime}
              onSlidingComplete={value => this.setState({ workTime: value })}
            />

            <Text style={styles.modalText}>Set your break duration</Text>
            <Text style={styles.modalText}>
              {this.state.breakTime}
            </Text>

            <Slider
              maximumValue={60}
              step={1}
              value={this.state.breakTime}
              onSlidingComplete={value => this.setState({ breakTime: value })}
            />

            <View style={styles.switchContainer}>
              <Text style={styles.modalText}>Enable encouraging messages</Text>

              <Switch
                value={this.props.encouragementEnabled}
                onValueChange={bool => this.props.setEncouragementEnabled(bool)}
              />
            </View>

            <View style={styles.buttonContainer}>
              <Button
                fontSize={15}
                onPress={() =>
                  this.props.onClose(this.state.workTime, this.state.breakTime)}
              >
                Close Menu
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalMenu);

const styles = MediaQueryStyleSheet.create(
  // Base styles
  {
    modalBackground: {
      flex: 1,
      justifyContent: "center",
      alignItems: "stretch",
      padding: 20,
      backgroundColor: colors.tomato
    },

    modalText: {
      fontFamily: "OpenSans-Regular",
      fontSize: 15,
      margin: 15,
      color: colors.grey
    },

    modalTitle: {
      color: colors.tomato,
      fontFamily: "YanoneKaffeesatz-Regular",
      fontSize: 30
    },

    modalInnerContainer: {
      flex: 1,
      alignItems: "stretch",
      backgroundColor: "white",
      padding: 20
    },

    modal: {
      flex: 0.25,
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "white"
    },

    buttonContainer: {
      margin: 20,
      flex: 1,
      justifyContent: "center"
    },

    switchContainer: {
      alignItems: 'center',
      flex: 1,
      flexDirection: 'row',
    }
  },
  // Responsive styles
  {
    "@media (min-device-height: 700)": {
      modalBackground: {
        backgroundColor: "rgba(12, 89, 128, 0.25)",
        justifyContent: "flex-end",
        paddingBottom: 50
      },

      modalTitle: {
        fontSize: 30
      },

      modalText: {
        fontSize: 18
      }
    },
    "@media (min-device-height: 1000)": {
      modalBackground: {
        paddingBottom: 100,
        paddingLeft: 120,
        paddingRight: 120
      }
    }
  }
);
