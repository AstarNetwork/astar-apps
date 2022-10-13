export {
  getTvlData,
  filterTvlData,
  formatNumber,
  mergeTvlArray,
  getTvlValue,
  getClaimedAmount,
  fetchTransferDetails,
} from 'src/modules/token-api/utils';

export {
  textChart,
  titleFormatter,
  valueDecimalsFormatter,
  seriesFormatter,
} from 'src/modules/token-api/chart';

export type Duration = '7 days' | '30 days' | '90 days' | '1 year';

// export const TOKEN_API_URL = 'https://api.astar.network/api';
export const TOKEN_API_URL = 'http://localhost:5001/astar-token-api/us-central1/app/api';

export interface TransferDetail {
  from: string;
  to: string;
  symbol: string;
  amount: string;
  isSuccess: boolean;
  timestamp: number;
}
