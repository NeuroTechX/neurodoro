// MenuIcon.js
// A three dot style menu that triggers the opening of a ModalMenu

import React, { Component } from 'react';
import {
  Image,
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import * as colors from '../styles/colors';

export default class MenuIcon extends Component {
  constructor(props) {
    super(props);
  }

  render() {
  return(
    <TouchableOpacity onPress={this.props.onPress}>
      <Image source={require('../assets/menu_button.png')} style={styles.image} resizeMode="contain"/>
    </TouchableOpacity>
  );
  }
}

const styles = StyleSheet.create({

  image: {
    transform: [{ rotate: '90deg'}],
    height: 25,
    width: 25,
  },
});