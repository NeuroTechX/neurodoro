# <p align="center">NEURODORO</p>

<p align="center">
    <img alt="babel" src="images/logo_final.png/" width="150">
</p>
<p align="center">
A brain-responsive Pomodoro timer for maximum productivity.
</p>

<p align="center">
  <a href="http://neurotechx.herokuapp.com/">
    <img src="http://neurotechx.herokuapp.com/badge.svg">
  </a>
</p>

## Overview

The goal behind Neurodoro is to create a fun, helpful application for EEG in everyday life. It is also an opportunity to practice applying machine learning library to EEG data.

If you've ever used the Pomodoro technique, you know that it can be helpful to avoid procrastination by breaking work up into manageable chunks. However, you might also appreciate how annoying it is when the technique forces you to stop working while you're still on task and 'in the zone'. What if we could make an app that would alter the length of a Pomodoro session, giving you more time if you're concentrated and less time if you're distracted? That's Neurodoro.

Neurodoro is still heavily in development. So far, we have built a simple Pomodoro Timer app with React Native that uses beta/theta band ratios from a Muse headband to update the amount of time remaining in the work session. However, this simple brainwave-based classifier doesn't perform as well as we'd like, which is why we've also included a cognitive test to create labeled attention performance data to train a deep neural network. By recording large datasets of user brain data labeled with the difficulty and performance scores from the cognitive test, we hope to be able to develop an algorithm that can determine whether the attentional and cognitive performance of a user is high or low based on a 2s epoch of their brainwaves.

Because we want this classifier to run locally on a smartphone with a continuous stream of data from the Muse, we are performing the majority of our ML development in TensorFlow, which can be [exported to Android](https://www.tensorflow.org/mobile/).

## Collecting Data

If you have an Android and a Muse headband, one of the best ways to help the Neurodoro project is to take our cognitive test while wearing your Muse and help us build a dataset. Download the app from the Play store, select 'Collect Data', and follow the instructions. Make sure you're connected to Wifi, because your EEG data will be streamed to our database as you are taking the test.

Note: our cognitive test, which runs on the Phaser engine, is also open source. Find it here: https://github.com/jdpigeon/corvo

## Contact

If you want to get involved with the Neurodoro project, get in touch with us on the [NeuroTechX Slack](https://neurotechx.herokuapp.com/) or create an issue. You'll find our thoughts, discussions, and plans to work together in the #neurodoro channel.

## Setup

1. Install and setup [React Native](https://facebook.github.io/react-native/docs/getting-started.html). Note: Neurodoro uses lots of native code, so create-react-native-app and Expo are not an option. Follow the instructions for "Building Apps with Native Code." You may also need to install the [JDK](https://www3.ntu.edu.sg/home/ehchua/programming/howto/JDK_Howto.html), [Node](https://nodejs.org/en/download/package-manager/), [Watchman](https://medium.com/@vonchristian/how-to-setup-watchman-on-ubuntu-16-04-53196cc0227c), and the [Gradle Daemon](https://docs.gradle.org/2.9/userguide/gradle_daemon.html) as well
2. Install [yarn](https://github.com/yarnpkg/yarn)
3. Clone this repo `git clone https://github.com/NeuroTechX/neurodoro.git`
4. run `yarn install` in the neurodoro folder
5. Connect an Android device with USB debug mode enabled. Because the LibMuse library depends on an ARM architecture, emulators are not an option
6. Run `react-native start` to start React packager
7. In new terminal, run `adb reverse tcp:8081 tcp:8081` to ensure debug server is connected to your device and then `react-native run-android` to install neurodoro
