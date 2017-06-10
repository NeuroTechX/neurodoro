// ModalMenu.js
// A popup modal menu

import React, { Component } from 'react';
import {
  Text,
  View,
  Modal,
  StyleSheet,
  Image,
  Slider,
} from 'react-native';
import { MediaQueryStyleSheet} from 'react-native-responsive';
import{
  Actions,
}from 'react-native-router-flux';
import Button from '../components/Button';
import * as colors from '../styles/colors'

export default class ModalMenu extends Component {
  constructor(props) {
    super(props);

    this.state = {
      workTime: 25,
      breakTime: 5,
    }
  }

  render() {
    return(
      <Modal
        animationType={"fade"}
        transparent={true}
        onRequestClose={() => this.props.onClose(this.state.workTime, this.state.breakTime)}
        visible={this.props.visible}>
        <View style={styles.modalBackground}>
          <View style={styles.modalInnerContainer}>
            <Text style={styles.modalTitle}>Settings</Text>
            <Text style={styles.modalText}>Set your target work duration:</Text>
            <Text style={styles.modalText}>{this.state.workTime}</Text>

            <Slider  maximumValue={60} step={1} value={this.state.workTime} onSlidingComplete={(value) => this.setState({workTime: value})} />

            <Text style={styles.modalText}>Set your break duration</Text>
            <Text style={styles.modalText}>{this.state.breakTime}</Text>

            <Slider  maximumValue={60} step={1} value={this.state.breakTime} onSlidingComplete={(value) => this.setState({breakTime: value})} />
            <View style={styles.buttonContainer}>
              <Button fontSize={15} onPress={() => this.props.onClose(this.state.workTime, this.state.breakTime)}>Close Menu</Button>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = MediaQueryStyleSheet.create(
  // Base styles
  {
    modalBackground: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'stretch',
      padding: 20,
      backgroundColor: colors.tomato,
    },

    modalText: {
      fontFamily: 'OpenSans-Regular',
      fontSize: 15,
      margin: 20,
      color: colors.grey,
    },

    modalTitle: {
      color: colors.tomato,
      fontFamily: 'YanoneKaffeesatz-Regular',
      fontSize: 30,
    },

    modalInnerContainer: {
      flex: 1,
      alignItems: 'stretch',
      backgroundColor: 'white',
      padding: 20,
    },

    modal: {
      flex: .25,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white',
    },

    buttonContainer: {
      margin: 20,
      flex: 1,
      justifyContent: 'center'
    }
  },
  // Responsive styles
  {
    "@media (min-device-height: 700)": {

      modalBackground: {
        backgroundColor: 'rgba(12, 89, 128, 0.25)',
        justifyContent: 'flex-end',
        paddingBottom: 50,
      },

      modalTitle: {
        fontSize: 30,
      },

      modalText: {
        fontSize: 18,
      },
    },
    "@media (min-device-height: 1000)": {
      modalBackground: {
        paddingBottom: 100,
        paddingLeft: 120,
        paddingRight: 120,
      }
    }
  });
