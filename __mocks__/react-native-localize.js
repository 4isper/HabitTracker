/**
 * Jest stub for the native `react-native-localize` module.
 *
 * `src/i18n` imports it, and `src/utils/date` imports `src/i18n`, so every
 * suite that touches either pulls in the real TurboModule lookup and crashes.
 * The real implementation is backed by native code that does not exist here.
 */

const deviceLocales = [];

function findBestLanguageTag(tags) {
  for (const locale of deviceLocales) {
    const languageTag = locale.languageTag;

    if (tags.includes(languageTag)) {
      return { languageTag, isRTL: Boolean(locale.isRTL) };
    }

    const base = languageTag.split('-')[0];

    if (tags.includes(base)) {
      return { languageTag: base, isRTL: Boolean(locale.isRTL) };
    }
  }

  return undefined;
}

module.exports = {
  __setDeviceLocales: next => {
    deviceLocales.splice(0, deviceLocales.length, ...next);
  },
  findBestLanguageTag,
  getLocales: () => deviceLocales,
  getCountry: () => 'US',
  getCalendar: () => 'gregorian',
  getCurrencies: () => [],
  getNumberFormatSettings: () => ({
    decimalSeparator: '.',
    groupingSeparator: ',',
  }),
  getTemperatureUnit: () => 'celsius',
  getTimeZone: () => 'UTC',
  uses24HourClock: () => false,
  usesAutoDateAndTime: () => true,
  usesAutoTimeZone: () => true,
  usesMetricSystem: () => true,
  openAppLanguageSettings: () => Promise.resolve(),
};