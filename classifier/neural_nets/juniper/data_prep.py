import pandas as pd
import numpy as np
import seaborn as sns
import sklearn as sk
import tensorflow as tf
from os import walk
from os import listdir
from os.path import isfile, join
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.neighbors import KNeighborsRegressor
from math import sqrt
import pyriemann
from mne import create_info, concatenate_raws
from mne.io import RawArray
from mne.channels import read_montage
from glob import glob
from pyriemann.estimation import Covariances, HankelCovariances
from pyriemann.tangentspace import TangentSpace
from pyriemann.clustering import Potato

# Steps
# 1. Concat all raw datasets together, leave out one session for testing
# 2. Clean a bit
# 3. Calculate slope
# 4. Create mne objects
# 5. Bundle into eeg epochs
# 6. Assign class labels

# Here are the good raw datasets

a = pd.read_csv("../../muse-data/Dano-08-11-RawEEG3.csv", header=0, index_col=False)
b = pd.read_csv("../../muse-data/Dano-08-11-RawEEG0.csv", header=0, index_col=False)
c = pd.read_csv("../../muse-data/josh_sep_21RawEEG2.csv", header=0, index_col=False)
d = pd.read_csv("../../muse-data/josh_sep_21_distracted_RawEEG0.csv", header=0, index_col=False)
test = pd.read_csv("../../muse-data/josh-raw-aug11RawEEG2.csv", header=0, index_col=False)

# Add them all together

data = [d]
data = pd.concat(data, ignore_index=True)
data = data[data.Performance > -200]
data = data[data.Performance != 0]
data.clip(lower=1)
data = data.drop('Timestamp (ms)', axis = 1)
data = data.reset_index(drop=True)

# Creating labels. Rather than using the difficulty of the current
# timestep as labels, use the slop over the following 10 seconds.
# Rationale; Performance at point t is a result of actions over 
# some previous time period

Difficulty_Slope = [] # in points per second [10, -10]
# slope_classes 
# 2: steep up, 1:shallow up, 0: flat, -1: shallow down, -2: steep down


for i in range(len(data)):
    # 256 samples/sec * 10 seconds in the future; may need to be adjusted
    if i < len(data)-2561 :
        j = i + 2560 
    else: 
        j = len(data)-1
        
    slope = (data.Difficulty[j] - data.Difficulty[i]) / ((j - i +1)/256)
    Difficulty_Slope.append(slope)

    if i % 50000 == 0:
        print("Slope at sample %s is %r" % (i, slope))

data['Difficulty_Slope'] = Difficulty_Slope

# rearrange columns, remove Performance
data = data[['Difficulty_Slope', 'Channel 1', 'Channel 2', 'Channel 3', 'Channel 4']]

sfreq = 256

# name of each channels 
ch_names = ['Difficulty_Slope', 'TP9', 'FP1', 'FP2', 'TP10']

# type of each channels
ch_types = ['stim'] + ['eeg'] * 4
montage = read_montage('standard_1005')

# get data and exclude Aux channel
data = data.values[:,-5:].T
data

# convert in Volts (from uVolts)
#data[:-1] *= 1e-6

# create mne objects
info = create_info(ch_names=ch_names, ch_types=ch_types, sfreq=sfreq, montage=montage)
raw = (RawArray(data=data, info=info))

raw.filter(2, 50, method='iir')

# Epochs

from mne import make_fixed_length_events, Epochs

# Make an events array with epoch times every .5 seconds
event = make_fixed_length_events(raw, 1, duration=0.5)

# Make an epochs array object from the raw dataset with events array event, length of 2 seconds
epochs = Epochs(raw, event, tmin=0, tmax=4, preload=True)

def difficulty_class(row):
    if row >= 3:
        return 'steep_up'
    elif row < 3 and row >= 0.5:
        return 'up'
    elif row < 0.5 and row >= -0.5:
        return 'flat'
    elif row < -0.5 and row >= -3:
        return 'down'
    else:
        return 'steep_down'

X = epochs.copy().pick_types(eeg=True).get_data()

y = epochs.copy().pick_types(eeg=False, stim=True).get_data().mean(axis=2)
y = np.apply_along_axis(difficulty_class, 1, y)
print(X.shape, y.shape)

covs = Covariances(estimator='lwf').fit_transform(X)

tans = TangentSpace().fit_transform(covs)
