# NEURODORO

<p align="center">
    <img alt="babel" src="images/logo_final.png/" width="300">
</p>

A brain-responsive Pomodoro timer for maximum productivity.

## Overview

Neurodoro is still entirely in development. We are working on creating a reliable, no-training-required concentration classifier in Tensorflow. We hope to improve the efficiency of the [http://lifehacker.com/productivity-101-a-primer-to-the-pomodoro-technique-1598992730](Pomodoro Technique) by allowing work sessions to be dynamically increased or decreased based on how absorbed the user is in their work.

## Setup

1. Install and setup React Native from the [Source website](https://facebook.github.io/react-native/docs/getting-started.html). We recommend setting up the [Gradle Daemon](https://docs.gradle.org/2.9/userguide/gradle_daemon.html) as well
2. Import android folder as a new project into Android Studio
3. Install [yarn](https://github.com/yarnpkg/yarn) and run `yarn install`. npm might work as well.
4. Connect an Android device with USB debug mode enabled. There can be issues running this app on a virtual device and we recommend real hardware. 
5. run `react-native start` to start React packager
5. In new terminal, `adb reverse tcp:8081 tcp:8081` to ensure debug server is connected to the device and `react-native run-android` to install

