#!/bin/python


from utils import BatchLoader

loader = BatchLoader('data/training_eeg.csv', 5, 2)
loader.next_batch()

