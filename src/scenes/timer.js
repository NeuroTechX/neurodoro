import React, { Component } from "react";
import {
  AppState,
  Text,
  View,
  NativeEventEmitter,
  NativeModules,
  Animated,
  Image
} from "react-native";
import { Actions } from "react-native-router-flux";
import BackgroundTimer from "react-native-background-timer";
import PushNotification from "react-native-push-notification";
import * as Animatable from "react-native-animatable";
import { connect } from "react-redux";
import _ from "lodash";
import config from "../redux/config";
import Clock from "../components/Clock";
import StartButton from "../components/StartButton";
import MenuIcon from "../components/MenuIcon";
import ModalMenu from "../components/ModalMenu";
import PopUp from "../components/PopUp";

import { MediaQueryStyleSheet } from "react-native-responsive";
import * as colors from "../styles/colors";

// Modules for bridged Java methods
import MuseConcentrationTracker from "../modules/MuseConcentrationTracker";

// Sets isVisible prop by comparing state.scene.key (active scene) to the key of the wrapped scene
function mapStateToProps(state) {
  return {
    connectionStatus: state.connectionStatus,
    encouragementEnabled: state.encouragementEnabled,
    scene: state.scene.sceneKey,
  };
}

const Sound = require("react-native-sound");
const breakSound = new Sound("jobs_done.mp3", Sound.MAIN_BUNDLE, error => {
  console.log("sound error: ", error);
});
const workSound = new Sound("level_up.mp3", Sound.MAIN_BUNDLE, error => {
  console.log("sound error: ", error);
});

let expected = 0;

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
    this.predictSubscription = {};
    this.timerTick = this.timerTick.bind(this);
    this.stopTimer = this.stopTimer.bind(this);

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
          console.log(
            "predictSubscription called with timeOnClock ",
            this.state.timeOnClock
          );
          this.animatedScore.setValue(score);
          if (this.state.timeOnClock >= 15 * MINUTE) {
            this.setState({ scoreBuffer: this.state.scoreBuffer.push(score) });
            if (this.state.scoreBuffer.length >= 30) {
              this.state.scoreBuffer.shift();
            }
            if (this.state.scoreBuffer.reduce((a, b) => a + b) <= 75); // mean of scoreBuffer <= 75
            this.setState({ workTime: this.state.workTime - 2 * MINUTE });
          }
        }
      );
    }
    this.initTracker();
  }

  componentWillUnmount() {
    console.log("willUnMount");
    AppState.removeEventListener("change", this.handleAppStateChange);
    this.stopTimer();
    expected = 0;
    BackgroundTimer.clearTimeout(this.TIMER_ID);
    if (
      this.props.connectionStatus === config.connectionStatus.CONNECTED &&
      this.predictSubscription != null
    ) {
      this.predictSubscription.cancel();
    }
  }

  handleAppStateChange = nextState => {
    this.setState({ appState: nextState });
  };

  timerTick() {
    let { timeOnClock, timer, onBreak, appState } = this.state,
      drift = new Date().getTime() - expected; // time drift. positive with overshoot

    if (_.isEqual(timer, this.PLAYING)) {
      let nextTime = timeOnClock + SECOND;
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

      this.setState({
        timeOnClock: nextTime,
        timer: timer,
        onBreak
      });

      // HACK: set expected to 0 to cancel timer
      if (expected != 0) {
        expected = expected + SECOND;
        this.TIMER_ID = BackgroundTimer.setTimeout(
          this.timerTick,
          Math.max(0, SECOND - drift)
        );
      }
    }
  }

  // Instantiates a timer that will update the timeOnClock state every 1 second
  initTracker() {
    if (this.props.connectionStatus == config.connectionStatus.CONNECTED) {
      MuseConcentrationTracker.init();
    }
  }

  startTimer = () => {
    expected = new Date().getTime() + SECOND;

    this.TIMER_ID = BackgroundTimer.setTimeout(this.timerTick, SECOND);
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
    const displayDate = new Date(ms);
    const m = displayDate.getMinutes();
    const s = displayDate.getSeconds();

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
          this.state.timeOnClock % ENCOURAGEMENT_INTERVAL === 0 &&
          this.props.encouragementEnabled
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
      const track = this.animatedScore.interpolate({
        inputRange: [0, 130],
        outputRange: ["-90deg", "90deg"]
      });
      return (
        <View style={styles.scoreContainer}>
          <Image
            source={require("../assets/conc_meter.png")}
            style={styles.logo}
            resizeMode="stretch"
          />
          <Animated.Image
            style={{
              bottom: 25,
              left: 75,
              resizeMode: "contain",
              position: "absolute",
              height: 100,
              transform: [{ rotate: track }]
            }}
            source={require("../assets/conc_pointer.png")}
          />
          <Text style={styles.meterTitle}>Focus Meter</Text>
        </View>
      );
    }
  }

  closeMenu(workTime, breakTime) {
    this.setState({
      menuVisible: false,
      workTime: workTime * MINUTE,
      breakTime: breakTime * MINUTE
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.menuContainer}>
          <MenuIcon onPress={() => this.setState({ menuVisible: true })} />
        </View>

        <View style={styles.titleContainer}>{this.renderDisplay()}</View>
        <View style={styles.spacerContainer}>{this.renderText()}</View>

        <View style={styles.spacerContainer}>{this.renderScore()}</View>

        <ModalMenu
          onClose={(workTime, breakTime) => this.closeMenu(workTime, breakTime)}
          visible={this.state.menuVisible}
        />
        <PopUp
          onClose={()=>Actions.ConnectorOne()}
          visible={
            this.props.connectionStatus === config.connectionStatus.DISCONNECTED && this.props.scene === 'Timer'
          }
          title={"Muse Disconnected"}
        >
          The Muse has disconnected. Please re-connect if you wish to continue
        </PopUp>
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
      flex: 2,
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

    scoreContainer: {
      alignItems: "center",
      justifyContent: "center",
      width: 200,
      height: 220
    },

    logo: {
      width: 200,
      height: 110
    },

    meterTitle: {
      fontFamily: "YanoneKaffeesatz-Regular",
      fontSize: 24,
      marginTop: 5,
      color: colors.black
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
