import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import{
  Actions,
}from 'react-native-router-flux';
import { connect } from 'react-redux';
import { MediaQueryStyleSheet }  from 'react-native-responsive';
import * as colors from '../styles/colors';

import config from '../redux/config'

// Components. For JS UI elements
import Button from '../components/Button';
import ConnectorWidget from '../components/ConnectorWidget';

// Sets isVisible prop by comparing state.scene.key (active scene) to the key of the wrapped scene
function  mapStateToProps(state) {
    return {
      connectionStatus: state.connectionStatus,
    };
  }

 class ConnectorTwo extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Step 2</Text>
          <Text style={styles.body}>Wait for your Muse to pair</Text>
        </View>
        <View style={styles.spacerContainer}>
          <ConnectorWidget/>
        </View>
        <View style={styles.buttonContainer}>
          <Button onPress={Actions.ConnectorThree} disabled={!(this.props.connectionStatus === config.connectionStatus.CONNECTED)}>Get Started!</Button>
        </View>
      </View>
    );
  }
}
export default connect(mapStateToProps)(ConnectorTwo);

const styles = MediaQueryStyleSheet.create(
  {
    // Base styles
    body: {
      fontFamily: 'OpenSans-Regular',
      fontSize: 25,
      margin: 20,
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
      flex: 2,
      justifyContent: 'center',
    },

    spacerContainer: {
      justifyContent: 'center',
      flex: 1,
    },

    buttonContainer: {
      justifyContent: 'center',
      flex: 1,
    },

    logo: {
      width: 200,
      height: 200,
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