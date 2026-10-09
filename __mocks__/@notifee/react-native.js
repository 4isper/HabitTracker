/**
 * Jest stub for `@notifee/react-native`.
 *
 * The real module is backed by native code. This stub records every call so
 * tests can assert on the alarms the app asks for.
 */

const scheduled = new Map();

function reset() {
  scheduled.clear();
}

function enums() {
  return {
    AlarmType: {
      SET: 0,
      SET_AND_ALLOW_WHILE_IDLE: 1,
      SET_EXACT: 2,
      SET_EXACT_AND_ALLOW_WHILE_IDLE: 3,
      SET_ALARM_CLOCK: 4,
    },
    AndroidImportance: {
      DEFAULT: 3,
      HIGH: 4,
      LOW: 2,
      MIN: 1,
      MAX: 5,
      NONE: 0,
    },
    AuthorizationStatus: {
      NOT_DETERMINED: -1,
      DENIED: 0,
      AUTHORIZED: 1,
      PROVISIONAL: 2,
    },
    RepeatFrequency: {
      HOURLY: 4,
      DAILY: 2,
      WEEKLY: 1,
    },
    TriggerType: {
      TIMESTAMP: 0,
      INTERVAL: 1,
    },
  };
}

let authorizationStatus = 1;

module.exports = {
  __esModule: true,
  ...enums(),
  default: {
    requestPermission: jest.fn(() =>
      Promise.resolve({ authorizationStatus }),
    ),
    createChannel: jest.fn(() => Promise.resolve('habit-reminders')),
    createTriggerNotification: jest.fn((notification, trigger) => {
      scheduled.set(notification.id, { notification, trigger });

      return Promise.resolve(notification.id);
    }),
    cancelTriggerNotification: jest.fn(id => {
      scheduled.delete(id);

      return Promise.resolve();
    }),
    cancelTriggerNotifications: jest.fn(ids => {
      (ids ?? [...scheduled.keys()]).forEach(id => scheduled.delete(id));

      return Promise.resolve();
    }),
    getTriggerNotificationIds: jest.fn(() =>
      Promise.resolve([...scheduled.keys()]),
    ),
  },
  __scheduled: scheduled,
  __setAuthorizationStatus: value => {
    authorizationStatus = value;
  },
  __reset: reset,
};