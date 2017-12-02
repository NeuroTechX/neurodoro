// WhiteButton.js
// A duplicate Button component for the early connector slides that is white instead of blue

import React, { Component } from "react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import * as colors from "../styles/colors";

export default class WhiteButton extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const fontSize = this.props.fontSize == null ? 21 : this.props.fontSize;
    const dynamicStyle = this.props.disabled ? styles.disabled : styles.active;
    return (
      <TouchableOpacity
        onPress={this.props.onPress}
        disabled={this.props.disabled}
      >
        <View style={dynamicStyle}>
          <Text style={[styles.text, { fontSize: fontSize }]}>
            {this.props.children}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  active: {
    justifyContent: "center",
    backgroundColor: colors.white,
    height: 50,
    margin: 5,
    padding: 5,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.black,
    elevation: 2,
  },

  disabled: {
    justifyContent: "center",
    backgroundColor: colors.grey,
    height: 50,
    margin: 5,
    padding: 5,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.black,
    elevation: 2,
  },

  text: {
    color: colors.black,
    fontFamily: "OpenSans-Regular",
  }
});
