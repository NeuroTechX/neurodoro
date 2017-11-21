// config.js
// Stores variables that are used in Redux

export default {
  navbarHeight: 64,
  statusbarHeight: 20,
  connectionStatus: {
    CONNECTED: 'CONNECTED',
    CONNECTING: 'CONNECTING',
    DISCONNECTED: 'DISCONNECTED',
    NO_MUSES: 'NO_MUSES',
    NOT_YET_CONNECTED: 'NOT_YET_CONNECTED',
    SEARCHING: 'SEARCHING',
    BLUETOOTH_DISABLED: 'BLUETOOTH_DISABLED'
  },
  dataType: {
    DENOISED_PSD: 'DENOISED_PSD',
    RAW_EEG: 'RAW_EEG',
    FILTERED_EEG: 'FILTERED_EEG',
  },
  destinations: {
    TIMER: "TIMER",
    CORVO: "CORVO",
  }
}
