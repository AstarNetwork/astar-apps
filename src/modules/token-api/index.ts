export {
  getTvlData,
  filterTvlData,
  formatNumber,
  mergeTvlArray,
  getTvlValue,
  getClaimedAmount,
  fetchTransferDetails,
  fetchDappsStats,
  fetchDappTransactions,
  fetchDappUAW,
  castDurationToDaysNumber,
  filterStatsData,
} from 'src/modules/token-api/utils';

export {
  textChart,
  titleFormatter,
  valueDecimalsFormatter,
  seriesFormatter,
} from 'src/modules/token-api/chart';

export type Duration = '7 days' | '30 days' | '90 days' | '1 year';

export const TOKEN_API_URL = 'https://api.astar.network/api';

export interface TransferDetail {
  from: string;
  to: string;
  symbol: string;
  amount: string;
  isSuccess: boolean;
  timestamp: number;
}

export interface XvmAssetsTransferHistory {
  timestamp: number;
  extrinsicHash: string;
  destination: string;
  amount: string;
  erc20Address: string;
}

export interface StatsDetail {
  timestamp: number;
  date: string;
  value: number;
}

export type StatsType = 'uniqueActiveUsers' | 'numberOfCalls';
