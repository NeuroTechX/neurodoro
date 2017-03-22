# <p align="center">NEURODORO</p>

<p align="center">
    <img alt="babel" src="images/logo_final.png/" width="150">
</p>
<p align="center">
A brain-responsive Pomodoro timer for maximum productivity.
</p>

## Overview

Neurodoro is still entirely in development. We have built a simple Pomodor timer in React Native and want to supercharge it with machine learning so that it can recognize concentration and focus with a Muse headband.

Right now we are protyping different classifiers in sklearn and Tensorflow, balancing what will be accurate and what can run efficiently on a mobile device.

## Setup

1. Install and setup React Native from the [Source website](https://facebook.github.io/react-native/docs/getting-started.html). We recommend setting up the [Gradle Daemon](https://docs.gradle.org/2.9/userguide/gradle_daemon.html) as well
2. Install [yarn](https://github.com/yarnpkg/yarn) and run `yarn install`. npm might work as well.
3. Connect an Android device with USB debug mode enabled. There can be issues running this app on a virtual device, so we recommend real hardware.
4. run `react-native start` to start React packager
5. In new terminal, `adb reverse tcp:8081 tcp:8081` to ensure debug server is connected to the device and `react-native run-android` to install
