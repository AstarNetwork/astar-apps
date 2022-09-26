export {
  faqDappStaking,
  faqH160Transfer,
  faqH160XcmBridge,
  faqSs58Transfer,
  faqSs58XcmBridge,
} from 'src/modules/information/faq';

export { hotTopics } from 'src/modules/information/hot-topics';

export { getTxHistories } from 'src/modules/information/recent-history';

export interface Faq {
  title: string;
  url: string;
}

export type RecentHistoryTxType = 'XCM' | 'Transfer';

export interface RecentHistory {
  timestamp: string;
  txType: RecentHistoryTxType;
  amount: string;
  symbol: string;
  note: string;
  explorerUrl: string;
}
