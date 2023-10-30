export {
  faqDappStaking,
  faqH160Transfer,
  faqH160XcmBridge,
  faqSs58Transfer,
  faqSs58XcmBridge,
  faqSs58XvmTransfer,
  faqZkEthereumBridge,
} from 'src/modules/information/faq';

export { hotTopics } from 'src/modules/information/hot-topics';

export {
  getTxHistories,
  getStakeTxHistories,
  castStakeTxType,
} from 'src/modules/information/recent-history';

export interface Faq {
  title: string;
  url: string;
}

export type RecentHistoryTxType =
  | 'XCM'
  | 'XVM Transfer'
  | 'Transfer'
  | 'BondAndStake'
  | 'NominationTransfer'
  | 'UnbondAndUnstake'
  | 'Reward';

export interface RecentHistory {
  timestamp: string;
  txType: RecentHistoryTxType;
  amount: string;
  symbol: string;
  note: string;
  explorerUrl: string;
}

export interface RecentStakeHistory {
  timestamp: string;
  amount: string;
  explorerUrl: string;
}
