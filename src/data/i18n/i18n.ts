import i18n from 'i18next';
import en from './en.json';
import nl from './nl.json';

i18n.init({
  resources: {
    nl: {
      i18n: {
        ...nl,
      },
    },
    en: {
      i18n: {
        ...en,
      },
    },
  },
  fallbackLng: 'en',

  ns: ['i18n'],
  defaultNS: 'i18n',

  interpolation: {
    escapeValue: true,
    formatSeparator: '.',
  },

  keySeparator: '.',
});

export default i18n;
