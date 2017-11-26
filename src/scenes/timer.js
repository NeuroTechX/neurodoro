import React, { Component } from "react";
import {
  AppState,
  Text,
  View,
  NativeEventEmitter,
  NativeModules,
  Animated
} from "react-native";
import BackgroundTimer from "react-native-background-timer";
import PushNotification from "react-native-push-notification";
import * as Animatable from "react-native-animatable";
import Svg, { Circle, Rect } from "react-native-svg";
import { connect } from "react-redux";
import _ from "lodash";
import config from "../redux/config";
import Clock from "../components/Clock";
import StartButton from "../components/StartButton";
import MenuIcon from "../components/MenuIcon";
import ModalMenu from "../components/ModalMenu";


import { MediaQueryStyleSheet } from "react-native-responsive";
import * as colors from "../styles/colors";

// Modules for bridged Java methods
import MuseConcentrationTracker from "../modules/MuseConcentrationTracker";

// Sets isVisible prop by comparing state.scene.key (active scene) to the key of the wrapped scene
function mapStateToProps(state) {
  return {
    connectionStatus: state.connectionStatus
  };
}

const Sound = require("react-native-sound");
const breakSound = new Sound("jobs_done.mp3", Sound.MAIN_BUNDLE, error => {
  console.log("sound error: ", error);
});
const workSound = new Sound("level_up.mp3", Sound.MAIN_BUNDLE, error => {
  console.log("sound error: ", error);
});

const SECOND = 1000;
const MINUTE = SECOND * 60;
const ENCOURAGEMENT_INTERVAL = SECOND * 10;
const ENCOURAGEMENTS = [
  "You are so smart",
  "You are good at your job",
  "Look at you hustle, homie",
  ":)",
  ":')",
  "Laser-like focus",
  "Intense concentration!",
  "Such work ethic",
  "You are strong and bright",
  "Send it",
  "Unreal!"
];

class Timer extends Component {
  constructor(props) {
    super(props);
    this.TIMER_ID = 0;
    this.PLAYING = "playing";
    this.PAUSED = "paused";
    this.RESET = "reset";
    this.animatedScore = new Animated.Value(50);

    this.state = {
      scoreBuffer: [],
      menuVisible: false,
      timeOnClock: 0,
      timer: this.PAUSED,
      onBreak: false,
      workTime: 25 * MINUTE,
      breakTime: 5 * MINUTE,
      appState: AppState.currentState
    };
  }

  componentDidMount() {
    AppState.addEventListener("change", this.handleAppStateChange);
    if (this.props.connectionStatus == config.connectionStatus.CONNECTED) {
      const scoreListener = new NativeEventEmitter(
        NativeModules.MuseConcentrationTracker
      );
      this.predictSubscription = scoreListener.addListener(
        "CONCENTRATION_SCORE",
        score => {
          this.animatedScore.setValue(score);
          if (this.state.timeOnClock >= 15 * MINUTE) {
            this.setState({ scoreBuffer: this.state.scoreBuffer.push(score)});
            if (this.state.scoreBuffer.length >= 30) {
              this.state.scoreBuffer.shift();
            }
            if (this.state.scoreBuffer.reduce((a, b) => a + b) <= 75); // mean of scoreBuffer <= 75
            this.setState({ workTime: this.state.workTime - 2 * MINUTE });
          }
        }
      );
    }
    this.configureTimer();
  }

  componentWillUnmount() {
    AppState.removeEventListener("change", this.handleAppStateChange);
    BackgroundTimer.clearInterval(this.TIMER_ID);
    if (this.props.connectionStatus === config.connectionStatus.CONNECTED) {
      this.predictSubscription.cancel();
    }
  }

  handleAppStateChange = nextState => {
    console.log("appState change detected");
    this.setState({ appState: nextState });
  };

  // Instantiates a timer that will update the timeOnClock state every 1 second
  configureTimer() {
    if (this.props.connectionStatus == config.connectionStatus.CONNECTED) {
      MuseConcentrationTracker.init();
    }

    this.TIMER_ID = BackgroundTimer.setInterval(() => {
      let { timeOnClock, timer, onBreak, appState } = this.state;
      if (_.isEqual(timer, this.PLAYING)) {
        let nextTime = timeOnClock + SECOND;
        const timerState = (() => {
          if (
            (nextTime >= this.state.workTime && !onBreak) ||
            (nextTime >= this.state.breakTime && onBreak)
          ) {
            timer = this.PAUSED;
            nextTime = 0;
            onBreak = !onBreak;
            if (onBreak) {
              breakSound.play();
            } else {
              workSound.play();
            }

            if (!_.isEqual(appState, "active")) {
              let details = {
                message: onBreak
                  ? "Take a break you genius!"
                  : "Re-orient and settle in for more work.",
                playSound: true
              };
              PushNotification.localNotification(details);
            }
          }
          return timer;
        })();

        this.setState({
          timeOnClock: nextTime,
          timer: timerState,
          onBreak
        });
      }
    }, SECOND);
  }

  startTimer = () => {
    if (this.props.connectionStatus === config.connectionStatus.CONNECTED) {
      MuseConcentrationTracker.startTracking();
    }
    this.setState({
      timer: this.PLAYING
    });
  };

  stopTimer = () => {
    if (this.props.connectionStatus === config.connectionStatus.CONNECTED) {
      MuseConcentrationTracker.stopTracking();
    }
    this.setState({
      timer: this.PAUSED
    });
  };

  parseTime = timeToDisplay => {
    const ms = Number(timeToDisplay);
    if (!_.isNumber(ms)) {
      console.error(NaN);
      return {
        minutes: -1,
        seconds: -1
      };
    }
    const date = new Date(ms);
    const m = date.getMinutes();
    const s = date.getSeconds();

    let minutes = `${m}`;
    if (m < 10) {
      minutes = `0${m}`;
    }

    let seconds = `${s}`;
    if (s < 10) {
      seconds = `0${s}`;
    }

    return {
      minutes,
      seconds
    };
  };

  renderDisplay() {
    const { timeOnClock } = this.state;
    const { minutes, seconds } = this.parseTime(timeOnClock);
    switch (this.state.timer) {
      case this.PLAYING:
        return (
          <Clock onPress={this.stopTimer} minutes={minutes} seconds={seconds} />
        );

      case this.PAUSED:
        return <StartButton onPress={this.startTimer} />;
    }
  }

  renderText() {
    switch (this.state.onBreak) {
      case true:
        return <Text style={styles.body}>Break!</Text>;

      case false:
        if (
          this.state.timeOnClock > 0 &&
          this.state.timeOnClock % ENCOURAGEMENT_INTERVAL === 0
        ) {
          return (
            <Animatable.Text
              animation="fadeOut"
              duration={1500}
              style={styles.body}
            >
              {
                ENCOURAGEMENTS[
                  Math.floor(Math.random() * ENCOURAGEMENTS.length)
                ]
              }
            </Animatable.Text>
          );
        }
    }
  }

  renderScore() {
    if (this.props.connectionStatus == config.connectionStatus.CONNECTED) {
      const opacity = this.animatedScore.interpolate({
        inputRange: [0, 75, 110],
        outputRange: [0, .25, 1]
      });
      const size = this.animatedScore.interpolate({
        inputRange: [0, 75, 110],
        outputRange: [20, 40, 200]
      });
      return (
        <View style={{height: 200, width: 200}}>
          <Svg height="200" width = "300">
            <Circle cx="50" cy="50" r="50" />
            <Rect x="50" y="50" width="50" height="50" />
          </Svg>
          <Animated.View
            style={{
              opacity,
              height: size,
              width: size,
              backgroundColor: colors.tomato
            }}
          />
        </View>

      );
    }
  }

  closeMenu(workTime, breakTime) {
    BackgroundTimer.clearInterval(this.TIMER_ID);
    this.setState({
      timer: this.PAUSED,
      menuVisible: false,
      timeOnClock: 0,
      workTime: workTime * MINUTE,
      breakTime: breakTime * MINUTE
    });

    this.configureTimer();
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.menuContainer}>
          <MenuIcon
            onPress={() =>
              this.setState({ menuVisible: true, timer: this.PAUSED })}
          />
        </View>

        <View style={styles.titleContainer}>
          {this.renderDisplay()}
        </View>
        {this.renderScore()}
        <View style={styles.spacerContainer}>
          {this.renderText()}
        </View>

        <ModalMenu
          onClose={(workTime, breakTime) => this.closeMenu(workTime, breakTime)}
          visible={this.state.menuVisible}
        />
      </View>
    );
  }
}

export default connect(mapStateToProps)(Timer);

const styles = MediaQueryStyleSheet.create(
  {
    // Base styles
    body: {
      fontFamily: "OpenSans-Regular",
      fontSize: 25,
      margin: 20,
      color: colors.grey,
      textAlign: "center"
    },

    title: {
      textAlign: "center",
      margin: 15,
      lineHeight: 50,
      color: colors.tomato,
      fontFamily: "YanoneKaffeesatz-Regular",
      fontSize: 50
    },

    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      margin: 50
    },

    menuContainer: {
      position: "absolute",
      right: -40,
      top: -30
    },

    titleContainer: {
      flex: 3,
      justifyContent: "center"
    },

    spacerContainer: {
      justifyContent: "center",
      flex: 1
    },

    buttonContainer: {
      justifyContent: "center",
      flex: 1
    },

    logo: {
      width: 200,
      height: 200
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
