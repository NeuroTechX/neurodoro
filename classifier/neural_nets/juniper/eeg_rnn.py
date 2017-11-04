from __future__ import print_function

from datetime import datetime
import numpy as np
import tensorflow as tf
from tensorflow.contrib import rnn
from utils import BatchLoader
import time
import os

import logging

# intialize logger
if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG, filename="training_log", filemode="w",
                        format="%(message)s")

# Training Parameters
learning_rate = 0.005
epochs = 1000
batch_size = 100
display_step = 10

# Network Parameters
num_features = 10 # Number of dimensions in tangent space produced by pyriemann
timesteps = 9 # Number of eeg epochs per sequence
num_hidden = 2048 # hidden layer num of neurons
num_classes = 2 # distracted or concentrated
num_layers = 1 # number of hidden layers
input_keep_prob = 1 # portion of incoming connections to keep
output_keep_prob = 1 # portion of outgoing connections to keep

logging.info("LR = " + str(learning_rate) + " Epochs = " + str(epochs))

# Initialize data feed
train_loader = BatchLoader('data/training_eeg.csv', batch_size, timesteps, num_features, num_classes, train=True)
valid_loader = BatchLoader('data/valid_eeg.csv', batch_size, timesteps, num_features, num_classes, train=False)

# tf Graph input
X = tf.placeholder("float", [batch_size, timesteps, num_features])
Y = tf.placeholder("float", [batch_size, num_classes])

# Define weights
weights = {
    'out': tf.Variable(tf.random_normal([num_hidden, num_classes]))
}
biases = {
    'out': tf.Variable(tf.random_normal([num_classes]))
}


def RNN(x, weights, biases, num_layers, input_keep_prob, output_keep_prob):

    # Unsatck to get a list of 'timesteps' tensors of shape (batch_size, n_input)
    x = tf.unstack(x, timesteps, 1)

    # Define layers of neurons
    cells = []
    for _ in range(num_layers):
        cell = rnn.BasicLSTMCell(num_hidden, forget_bias=1, state_is_tuple=True, activation=tf.nn.relu)
        if output_keep_prob < 1.0 or input_keep_prob < 1.0:
            cell = rnn.DropoutWrapper(cell,
                                      input_keep_prob=input_keep_prob,
                                      output_keep_prob=output_keep_prob)
        cells.append(cell)

    layers = rnn.MultiRNNCell(cells, state_is_tuple=True)

    # Get lstm cell output
    outputs, states = rnn.static_rnn(layers, x, dtype=tf.float32)
    
    # Linear activation, using rnn inner loop last output
    return tf.matmul(outputs[-1], weights['out']) + biases['out']

logits = RNN(X, weights, biases, num_layers, input_keep_prob, output_keep_prob)
prediction = tf.nn.softmax(logits)

# Define loss and optimizer
loss_op = tf.reduce_mean(tf.nn.softmax_cross_entropy_with_logits(
    logits=logits, labels=Y))
optimizer = tf.train.GradientDescentOptimizer(learning_rate=learning_rate)
train_op = optimizer.minimize(loss_op)

# Evaluate model 
correct_pred = tf.equal(tf.argmax(prediction, 1), tf.argmax(Y, 1))
accuracy = tf.reduce_mean(tf.cast(correct_pred, tf.float32))

# Initialize the variable (i.e. assign their default value)
init = tf.global_variables_initializer()

# Run validation set

def validate():
    valid_loader.valid_pointer = 0
    validation_accuracy = []
    input_keep_prob = 1
    output_keep_prob = 1
    for v in range(valid_loader.num_batches):
        valid_x, valid_y = valid_loader.next_batch()
        valid_acc = sess.run(accuracy, feed_dict={X:valid_x, Y:valid_y})
        validation_accuracy.append(valid_acc)

    logging.info("Validation Accuracy: " + str(sum(validation_accuracy) / valid_loader.num_batches) + " " + str(datetime.now()))
    print("Validation Accuracy: " + str(sum(validation_accuracy) / valid_loader.num_batches))

# Start training
with tf.Session() as sess:
    # instrument for tensorboard
    writer = tf.summary.FileWriter(
            os.path.join('tensorboard/log/', time.strftime("%Y-%m-%d-%H-%M-%S")))
    writer.add_graph(sess.graph)
 
    # Run the initializer
    sess.run(init)

    for e in range(epochs):
        epoch_accuracy = []
        train_loader.reset_batch_pointer()
        for b in range(train_loader.num_batches):
            batch_x, batch_y = train_loader.next_batch()
            loss, acc, _ = sess.run([loss_op, accuracy, train_op], feed_dict={X: batch_x, Y: batch_y})
            epoch_accuracy.append(acc)
            if b == train_loader.num_batches-1  and (e + 1) % display_step == 0:      
                # Calculate epoch loss and accuracy
                logging.info("Epoch " + str(e + 1) + 
                        ", batch " + str(b) +
                        ", Minibatch Loss= " + \
                        "{:.4f}".format(loss) +  "    " + 
                        str(datetime.now()))
                logging.info("Epoch Accuracy: " + str(sum(epoch_accuracy) / train_loader.num_batches))  
                print("Epoch Accuracy: " + str(sum(epoch_accuracy) / train_loader.num_batches) + "    Batch Loss: " +str( loss)) 
 
                # check validation accuracy
                validate()

                # intrument for tensorboard
                tf.summary.scalar('loss', loss)    
                tf.summary.scalar('accuracy', acc)
                summaries = tf.summary.merge_all()
                summ = sess.run(summaries)
                writer.add_summary(summ, e)


    logging.info("Optimization Finisihed!")

    validate()
