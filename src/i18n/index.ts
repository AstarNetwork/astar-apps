import enUS from './en-US';
import zh from './zh';
import zhTW from './zh-TW';
import ja from './ja';
import fr from './fr';
import pt from './pt';
import kr from './kr';
import it from './it';
import es from './es';

export const languagesSelector = [
  {
    text: 'English',
    code: 'en-US',
  },
  {
    text: '日本語',
    code: 'ja',
  },
  // Todo: need to update the translation files
  // {
  //   text: '简体中文',
  //   code: 'zh',
  // },
  // {
  //   text: '繁體中文',
  //   code: 'zh-TW',
  // },
  {
    text: 'Français',
    code: 'fr',
  },
  {
    text: 'Português',
    code: 'pt',
  },
  {
    text: '한국어',
    code: 'kr',
  },
  {
    text: 'Italiano',
    code: 'it',
  },
  {
    text: 'Español',
    code: 'es',
  },
];

export default {
  'en-US': enUS,
  ja,
  zh,
  'zh-TW': zhTW,
  fr,
  pt,
  kr,
  it,
  es,
};

export type CultureCode = 'it' | 'en-US' | 'ja' | 'fr' | 'pt' | 'kr' | 'zh' | 'zh-TW' | 'es';
