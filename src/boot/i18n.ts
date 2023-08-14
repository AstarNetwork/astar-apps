import { boot } from 'quasar/wrappers';
import { createI18n } from 'vue-i18n';

import messages from 'src/i18n';
import { LOCAL_STORAGE } from 'src/config/localStorage';

const languageCode = localStorage.getItem(LOCAL_STORAGE.SELECTED_LANGUAGE);

const i18n = createI18n({
  locale: languageCode || 'en-US',
  fallbackLocale: 'en-US',
  legacy: false,
  messages,
});

export default boot(({ app }) => {
  // Set i18n instance on app
  app.use(i18n);
});

export { i18n };
