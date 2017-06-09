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

The goal behind Neurodoro is to create a fun, helpful application for EEG in everyday life. It is also an opportunity to practice applying the Keras machine learning library to EEG data.

If you've ever used the Pomodoro technique, you know that it can be helpful to avoid procrastination by breaking work up into manageable chunks. However, you might also appreciate how annoying it is when the tecnique forces you to stop working while you're still on task and 'in the zone'. What if we could make an app that would alter the length of a Pomodoro session, giving you more time if you're concentrated and less time if you're distracted? That's Neurodoro.

Neurodoro is still entirely in development. So far, we have built a simple Pomodoro Timer with React Native and allowed to it record EEG data from a Muse headband while a user takes a cognitive test. The [cognitive test](https://github.com/StanfordCosyne/screener) is attentionally demanding and uses ML itself to scale difficulty based on a user's performance. By recording large datasets of user brain data labeled with the difficulty and performance scores from the cognitive test, we hope to be able to develop an algorithm that can determine whether the attentional and cognitive performance of a user is high or low based on a 2s epoch of their brainwaves.  

Because we want this classifier to run locally on a smartphone with a continuous stream of data from the Muse, we would like the end-product of our algorithm development to be a TensorFlow graph that can be [exported to Android](https://www.tensorflow.org/mobile/).

We know that training an EEG classifier that works for everyone will be hard. That's why we're partnering with the [Cloudbrain](http://getcloudbrain.com/) wearable data analytics platform. By pooling test data from lots of users and training classifiers in the cloud, we hope to get the best accuracy for our classifier. Then, through a form of [Federated Learning](https://research.googleblog.com/2017/04/federated-learning-collaborative.html), we'll allow the last few layers of the cloud-trained model to be adapted to a user's particular brain idiosyncrasies.

We'll need quite a bit of help to pull this off, though. If you're interested in contributing, join us in the #neurodoro channel of the [NeuroTechX Slack](http://neurotechx.herokuapp.com/) or take a look at the open issues here on GitHub.

## Setup

1. Install and setup React Native from the [Source website](https://facebook.github.io/react-native/docs/getting-started.html). We recommend setting up the [Gradle Daemon](https://docs.gradle.org/2.9/userguide/gradle_daemon.html) as well
2. Install [yarn](https://github.com/yarnpkg/yarn) and run `yarn install`. npm might work as well.
3. Connect an Android device with USB debug mode enabled. There can be issues running this app on a virtual device, so we recommend real hardware.
4. run `react-native start` to start React packager
5. In new terminal, `adb reverse tcp:8081 tcp:8081` to ensure debug server is connected to the device and `react-native run-android` to install
