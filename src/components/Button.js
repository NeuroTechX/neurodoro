// Button.js
// An orange, rounded-square, AirBnB-style button with bold text that can be created with both onPress and disabled props
// onPress is an arrow function that can be pretty much anything
// disabled is a boolean that is passed to TouchableOpacity's built in disabled prop.

import React, { Component } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { MediaQueryStyleSheet } from "react-native-responsive";
import _ from "lodash";
import * as colors from "../styles/colors";

export default class Button extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const fontSize = _.isNil(this.props.fontSize) ? 21 : this.props.fontSize;
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

const styles = MediaQueryStyleSheet.create(
  {
    // Base styles

    active: {
      justifyContent: "center",
      backgroundColor: colors.tomato,
      borderRadius: 10,
      margin: 5,
      alignItems: "center",
      padding: 15,
      paddingLeft: 30,
      paddingRight: 30,
      elevation: 2,

    },

    disabled: {
      justifyContent: "center",
      backgroundColor: colors.lightGrey,
      borderRadius: 10,
      margin: 5,
      alignItems: "center",
      padding: 15,
      paddingLeft: 25,
      paddingRight: 25,
      elevation: 2,

    },

    text: {
      color: colors.white,
      fontFamily: "OpenSans-Regular",
      fontWeight: "700"
    }
  },
  // Responsive styles
  {
    "@media (min-device-height: 700)": {
      active: {
        marginLeft: 20,
        marginRight: 20
      },
      disabled: {
        marginLeft: 20,
        marginRight: 20
      }
    }
  }
);
