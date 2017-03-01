/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity
} from 'react-native';

import TensorFlowModule from './src/modules/TensorFlow';
export default class tfreactnative extends Component {
  constructor(props) {
    super(props)
    this.state = {
      num1: '1',
      num2: '2',
      num3: '3',
      result1: '',
      result2: ''
    }
  }

  render() {
    return (
      <View style={styles.container}>

        <View style={{flex: 1, justifyContent: 'center'}}>
          <Text style={styles.welcome}>
            A TensorFlow app in React Native!
          </Text>
        </View>

        <View style={{flex: 2}}>

        <Text>These values will be input to a neural network</Text>
        <View style={styles.numberContainer}>
          <TextInput style={{height: 40}}
                     onChangeText={(value) => this.setState({num1: value})}
                     value={this.state.num1}/>
          <TextInput style={{height: 40}}
                     onChangeText={(value) => this.setState({num2: value})}
                     value={this.state.num2}/>
          <TextInput style={{height: 40}}
                     onChangeText={(value) => this.setState({num3: value})}
                     value={this.state.num3}/>

        </View>

        <View style={{flex:1}}>
          <TouchableOpacity onPress={() => TensorFlowModule.runInference(Number(this.state.num1), Number(this.state.num2), Number(this.state.num3))
          .then((result) => {
            this.setState({result1: result[0]});
            this.setState({result2: result[1]});
          })}>
            <View style={{backgroundColor: '#fff16e',justifyContent: 'center',
            borderRadius: 15,
      height: 50,
      margin: 5,
      padding: 10,
      alignItems: 'center',}}>
              <Text>Send values to TensorFlow</Text>
            </View>
          </TouchableOpacity>
        </View>

          <View style={{flex:1}}>

          <Text>Results:</Text>
          <View style={styles.numberContainer}>
            <Text>{this.state.result1}</Text>
            <Text>{this.state.result2}</Text>
          </View>
        </View>
        </View>
    </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  numberContainer: {
    margin: 30,
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  welcome: {
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('tfreactnative', () => tfreactnative);
