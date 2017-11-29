// Clock.js
// A clock that displays minutes and seconds

import React, { Component } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import * as colors from '../styles/colors';

export default class Clock extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <TouchableOpacity onPress={this.props.onPress}>
        <Text style={styles.clock}>
          <Text>{this.props.minutes}</Text>
          <Text>:</Text>
          <Text>{this.props.seconds}</Text>
        </Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({

  clock: {
    textAlign: 'center',
    margin: 15,
    color: colors.tomato,
    fontFamily: 'YanoneKaffeesatz-Regular',
    fontSize: 60,
  },
});
