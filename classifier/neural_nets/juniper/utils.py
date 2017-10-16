import codecs
import os
import collections
from six.moves import cPickle
import numpy as np


class BatchLoader():
    def __init__(self, data_dir, batch_size, seq_length):
        self.data_dir = data_dir
        self.batch_size = batch_size
        self.seq_length = seq_length

        input_file = os.path.join(data_dir, "tangent_space_eeg.csv")
        
        self.preprocess(input_file)
        self.create_batches()
        self.reset_batch_pointer()

    def preprocess(self, input_file):
        self.tensor = np.genfromtxt(input_file, delimiter=",")
        self.tensor = self.tensor.reshape(len(self.tensor), 1, 12)

    def create_batches(self):
        self.num_batches = int(self.tensor.size / (self.batch_size *
                                                   self.seq_length))
        print("num_batches: %s" % (self.num_batches))

        # When the data (tensor) is too small,
        # let's give them a better error message
        if self.num_batches == 0:
            assert False, "Not enough data. Make seq_length and batch_size small."

        self.tensor = self.tensor[:self.num_batches * self.batch_size * self.seq_length]
        batched_data = self.tensor.reshape(-1, self.seq_length, 12)
        xdata = batched_data[:,:,2:12]
        ydata = batched_data[:,4,0:2]
        self.x_batches = np.array_split(xdata,
                                  self.num_batches, 0)
        self.y_batches = np.array_split(ydata,
                                  self.num_batches, 0)

    def next_batch(self):
        x, y = self.x_batches[self.pointer], self.y_batches[self.pointer]
        self.pointer += 1
        return x, y

    def reset_batch_pointer(self):
        self.pointer = 0
