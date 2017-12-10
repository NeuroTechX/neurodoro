# ICA Derived EEG Correlates of Mental Fatigue Notes

Examined EEG correlates of time on task, workload, and effort.

Used ICA to find five independent component signals that were associated with specific brain areas (using HD-EEG)

Spectral powers at corresponding dominant bands (theta for frontal and alpha for other four) were correlated with mental workload and effort.

Linear regression showed that spectral powers at all five ICs increased with time on task (mental fatigue)

## Definitions

- Mental fatigue: unwillingness to perform cognitively challenging tasks

- Mental workload: objective task demand

- Mental effort: amount of mental capacity allocated to meet task demands

The above three are inter-related. For example, mental effort has been shown to increase both with an increase in workload, but also to compensate for fatigue-related performance decrements

## Previous work

"For example, theta band power changes were usually found at the frontal midline channels to be linked to the development of mental fatigue (Yamamoto and Matsuoka, 1990; Gevins et al., 1995; Onton et al., 2005; Chai et al., 2016),"

"Alpha power changes are also associated with reduction in attention with TOT (Klimesch, 1999; Schier, 2000)."

## Experiment

Used air-traffic control type task


## Preprocessing

"EEG data were preprocessed using the Net Station Software (Electrical Geodesics, Inc., OR, USA). After applying a band-pass filter of 0.5–30 Hz, noisy channels were identified if a channel has more than 20% of data above an amplitude threshold of 200 μV over the entire recording and then replaced with data interpolated from neighboring channels using a spherical spline method from the Net Station Software (Perrin et al., 1989). EEG data were then down-sampled to 125 Hz to reduce computational loads. Extended Infomax ICA (Lee et al., 1999) from the EEGLAB toolbox was performed for artifacts rejection. Artifactual ICs were identified using: (1) the ADJUST software (Mognon et al., 2011) to automatically identify ICs related to eye blink, vertical/horizontal eye movement, and generic discontinuity; (2) visual inspection to identify ICs related to electromyogram (EMG) and electrocardiogram (ECG). All artifactual ICs identified were removed to obtain artifact-free EEG data for subsequent analyses."
