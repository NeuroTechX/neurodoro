""" Recurrent Neural Network.
Recurrent Neural Network (LSTM) implementation example using TensorFlow library.
This example is using the MNIST database of handwritten digits (http://yann.lecun.com/exdb/mnist/)
Links:
    [Long Short Term Memory](http://deeplearning.cs.cmu.edu/pdfs/Hochreiter97_lstm.pdf)
    [MNIST Dataset](http://yann.lecun.com/exdb/mnist/).
Author: Aymeric Damien
Project: https://github.com/aymericdamien/TensorFlow-Examples/
"""

from __future__ import print_function

import numpy as np
import tensorflow as tf
from tensorflow.contrib import rnn
from utils import BatchLoader

sess = tf.InteractiveSession()

# Training Parameters
learning_rate = 0.001
epochs = 10000
batch_size = 5
display_step = 100

# Network Parameters
num_imput = 10 # Number of dimension in tangent space via pyriemann
timesteps = 2 # two two-second eeg epochs per sequence
num_hidden = 64 # hidden layer num of features
num_classes = 2 # distracted or concentrated

# Initialize data feed
loader = BatchLoader('data', batch_size, timesteps) 

# tf Graph input
X = tf.placeholder("float", [batch_size, timesteps, num_imput])
Y = tf.placeholder("float", [batch_size, 2])

# Define weights
weights = {
    'out': tf.Variable(tf.random_normal([num_hidden, num_classes]))
}
biases = {
    'out': tf.Variable(tf.random_normal([num_classes]))
}


def RNN(x, weights, biases):

    # Prepare data shape to match `rnn` funtion requirements
    # Current data input shape: (batch_size, timesteps, n_input)
    # Required shape: 'timesteps' tensors list of shape (batch_size, n_input)

    # Unsatck to get a list of 'timesteps' tensors of shape (batch_size, n_input)
    x = tf.unstack(x, timesteps, 1)

    # Define a lstm cell with tensorflow
    lstm_cell = rnn.BasicLSTMCell(num_hidden, forget_bias=0.1)

    # Get lstm cell output
    outputs, states = rnn.static_rnn(lstm_cell, x, dtype=tf.float32)
    
    # Linear activation, using rnn inner loop last output
    return tf.matmul(outputs[-1], weights['out']) + biases['out']

logits = RNN(X, weights, biases)
prediction = tf.nn.softmax(logits)

# Define loss and optimizer
loss_op = tf.reduce_mean(tf.nn.softmax_cross_entropy_with_logits(
    logits=logits, labels=Y))
optimizer = tf.train.GradientDescentOptimizer(learning_rate=learning_rate)
train_op = optimizer.minimize(loss_op)

# Evaluate model 
correct_pred = tf.equal(tf.argmax(prediction, 1), tf.argmax(Y, 1))
accuracy = tf.reduce_mean(tf.cast(correct_pred, tf.float32))

def print_eval():
    print("pred: " + str(sess.run(prediction, feed_dict={X: batch_x, Y: batch_y})))
    print("Y: " + str(sess.run(Y, feed_dict={X: batch_x, Y: batch_y})))
    print("epoch accuracy: " + str(sum(epoch_accuracy) / loader.num_batches))
#    print("outputs: " + str(sess.run(outputs, feed_dict={X: batch_x, Y: batch_y })))
#    print("argmax_pred: " + str(tf.argmax(prediction, 1).eval()))
#    print("argmax_Y: " + str(tf.argmax(Y, 1).eval()))
#    print("equal: " + str(tf.equal(tf.argmax(prediction, 1), tf.argmax(Y, 1)).eval()))


# Initialize the variable (i.e. assign their default value)
init = tf.global_variables_initializer()

# Start training
with tf.Session() as sess:

    # Run the initializer
    sess.run(init)

    for e in range(epochs):
        epoch_accuracy = []
        loader.reset_batch_pointer()
        for b in range(loader.num_batches):
            batch_x, batch_y = loader.next_batch()
            sess.run(train_op, feed_dict={X: batch_x, Y: batch_y})
            batch_acc = sess.run(accuracy, feed_dict={X:batch_x, Y:batch_y})
            epoch_accuracy.append(batch_acc)
            if b == 229 and e % display_step == 0:        
                # Calculate epoch loss and accuracy
                loss, acc = sess.run([loss_op, accuracy], feed_dict={X: batch_x, Y: batch_y})

                print("Epoch " + str(e) + 
                        ", batch " + str(b) +
                        ", Minibatch Loss= " + \
                        "{:.4f}".format(loss) + ", Training Accuracy= " + \
                        "{:.3f}".format(acc))
                print_eval()
    
    print("Optimization Finished!")

    # Calculate test accuracy
