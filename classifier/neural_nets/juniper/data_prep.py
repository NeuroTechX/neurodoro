import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import sklearn as sk
from sklearn.linear_model import LinearRegression
from os import walk
from os import listdir
from os.path import isfile, join
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neighbors import KNeighborsRegressor
from sklearn.pipeline import make_pipeline
from sklearn.metrics import accuracy_score
from tpot import TPOTRegressor
from math import sqrt
import pyriemann
from mne import create_info, concatenate_raws
from mne.io import RawArray
from mne.channels import read_montage
from glob import glob
from pyriemann.utils.viz import plt, plot_confusion_matrix, plot_embedding
from pyriemann.estimation import Covariances, HankelCovariances
from pyriemann.tangentspace import TangentSpace
from pyriemann.clustering import Potato

# Here are the good raw datasets

a = pd.read_csv("data/muse-data/Dano-08-11-RawEEG3.csv", header=0, index_col=False)
b = pd.read_csv("data/muse-data/Dano-08-11-RawEEG0.csv", header=0, index_col=False)
c = pd.read_csv("data/muse-data/josh_sep_21RawEEG2.csv", header=0, index_col=False)
d = pd.read_csv("data/muse-data/josh_sep_21_distracted_RawEEG0.csv", header=0, index_col=False)
e = pd.read_csv("data/muse-data/josh-raw-aug11RawEEG2.csv", header=0, index_col=False)

# Add them all together
data = [a,b,c,d,e]
data = pd.concat(data, ignore_index=True)
data = data[data.Difficulty > -200]
data = data[data.Difficulty != 0]
data.clip(lower=1)
data = data.drop('Timestamp (ms)', axis = 1)
data = data.reset_index(drop=True)

sfreq = 256

# name of each channels 
ch_names = ['Difficulty', 'Performance', 'TP9', 'FP1', 'FP2', 'TP10']

# type of each channels
ch_types = ['stim'] * 2 + ['eeg'] * 4
montage = read_montage('standard_1005')

# get data and exclude Aux channel
data = data.values[:,-6:].T
data

# convert in Volts (from uVolts)
#data[:-1] *= 1e-6

# create mne objects
info = create_info(ch_names=ch_names, ch_types=ch_types, sfreq=sfreq, montage=montage)
raw = (RawArray(data=data, info=info))

# Setting up band-pass filter from 2 - 50 Hz
raw.filter(2, 50, method='iir')

## Plot the PSD of the EEG data just to make sure it looks alright
#raw.plot_psd(picks=[2]);

from mne import make_fixed_length_events, Epochs

# Make an events array with epoch times every .5 seconds
event = make_fixed_length_events(raw, 1, duration=0.5)

# Make an epochs array object from the raw dataset with events array event, length of 2 seconds
epochs = Epochs(raw, event, tmin=0, tmax=4, preload=True)

def difficulty_class(diff_perf):
    if diff_perf[0] < 30 and diff_perf[1] < 70 and diff_perf[1] > 20:
        return [1,0]
    else:
        return [0,1]

X = epochs.copy().pick_types(eeg=True).get_data()

diff_perf = epochs.copy().pick_types(eeg=False, stim=True).get_data().mean(axis=2)
y = np.apply_along_axis(difficulty_class, 1, diff_perf)
y = np.reshape(y, (len(y),2))
print(X.shape, y.shape)

# Let's transform our data into a covariance matrix and a tangentspace
covs = Covariances(estimator='lwf').fit_transform(X)
tans = TangentSpace().fit_transform(covs)

output_data = np.concatenate((y, tans), axis=1)

split = int(len(output_data) / 10)
train = pd.DataFrame(output_data[:len(output_data)-split,:])
valid = pd.DataFrame(output_data[len(output_data)-split:,:])

train.to_csv('/Users/joshharris/neurodoro/classifier/neural_nets/juniper/data/training_eeg.csv', header=False, index=False)
valid.to_csv('/Users/joshharris/neurodoro/classifier/neural_nets/juniper/data/valid_eeg.csv', header=False, index=False)
