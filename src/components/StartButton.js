// StartButton.js
// A cute logo button for starting the timer

import React, { Component } from 'react';
import {
  Image,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MediaQueryStyleSheet } from 'react-native-responsive';
import * as colors from '../styles/colors';

export default class StartButton extends Component{
  constructor(props){
    super(props);

  }

  render() {

    return(
      <TouchableOpacity onPress={this.props.onPress}>
        <Image source={require('../assets/startbutton.png')} style={styles.logo} resizeMode='stretch'/>
      </TouchableOpacity>
    )
  }

};

const styles = MediaQueryStyleSheet.create(
  {
    // Base styles
    logo: {
      width: 200,
      height: 200,
    },
  },
);



