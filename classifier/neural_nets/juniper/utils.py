import codecs
import os
import collections
from six.moves import cPickle
import numpy as np


class BatchLoader():
    def __init__(self, input_file, batch_size, seq_length, num_features, num_classes, train):
        self.input_file = input_file
        self.batch_size = batch_size
        self.seq_length = seq_length
        self.num_features = num_features
        self.num_classes = num_classes
        self.train = train
        
        self.preprocess(input_file)
        self.sequence_windows()
        self.create_batches()
        self.reset_batch_pointer()

    def preprocess(self, input_file):
        self.tensor = np.genfromtxt(input_file, delimiter=",")

    def sequence_windows(self):
        xdata = []
        ydata = []
        # For each eeg epoch, get seq_length previous epochs and store current label
        for i in range(len(self.tensor)):
            if i + self.seq_length < len(self.tensor):
                t = i + self.seq_length
                x = self.tensor[i:t,self.num_classes:self.num_classes + self.num_features]
                y = self.tensor[t,0:self.num_classes]
                xdata.append(x)
                ydata.append(y)
        self.xdata = np.array(xdata)
        self.ydata = np.array(ydata)
        print("x: " + str(self.xdata.shape) +  "    y: " + str(self.ydata.shape))

    def create_batches(self):
        self.num_batches = int(len(self.xdata) / self.batch_size)
        print("num_batches: %s" % (self.num_batches))

        # When the data (tensor) is too small,
        # let's give them a better error message
        if self.num_batches == 0:
            assert False, "Not enough data. Make seq_length and batch_size small."
        
        self.xtrimmed = self.xdata[:self.num_batches * self.batch_size]
        self.ytrimmed = self.ydata[:self.num_batches * self.batch_size]
        self.x_batches = np.array_split(self.xtrimmed, self.num_batches, 0)
        self.y_batches = np.array_split(self.ytrimmed, self.num_batches, 0)
        
    def next_batch(self):
        if self.train == True:
            x, y = self.x_batches[self.train_pointer], self.y_batches[self.train_pointer]
            self.train_pointer += 1
        else:
            x, y = self.x_batches[self.valid_pointer], self.y_batches[self.valid_pointer]
            self.valid_pointer += 1
        return x, y

    def reset_batch_pointer(self):
        self.train_pointer = 0
        self.valid_pointer = 0

    def get_x_and_y(self):
        x, y = self.xdata, self.ydata
        return x, y
