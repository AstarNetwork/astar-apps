export {
  faqH160Transfer,
  faqH160XcmBridge,
  faqSs58Transfer,
  faqSs58XcmBridge,
} from 'src/modules/transfer/faq';
export { hotTopics } from 'src/modules/transfer/hot-topics';
export { getTxHistories } from 'src/modules/transfer/recent-history';

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
