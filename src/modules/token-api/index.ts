export {
  getTvlData,
  filterTvlData,
  formatNumber,
  mergeTvlArray,
  getTvlValue,
  getClaimedAmount,
} from './utils';

export { textChart, titleFormatter, valueDecimalsFormatter, seriesFormatter } from './chart';

export type Duration = '7 days' | '30 days' | '90 days' | '1 year';

export const TOKEN_API_URL = 'https://api.astar.network/api';
