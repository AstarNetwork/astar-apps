import enUS from './en-US';
import zh from './zh';
import zhTW from './zh-TW';
import ja from './ja';

export const languagesSelector = [
  {
    text: 'English',
    code: 'en-US',
  },
  {
    text: '日本語',
    code: 'ja',
  },
  {
    text: '简体中文',
    code: 'zh',
  },
  {
    text: '繁體中文',
    code: 'zh-TW',
  },
];

export default {
  'en-US': enUS,
  ja: ja,
  zh: zh,
  'zh-TW': zhTW,
};
