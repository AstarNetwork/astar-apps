export { getTvlData, filterTvlData, formatNumber, mergeTvlArray, getTvlValue } from './utils';

export type Duration = '7 days' | '30 days' | '90 days' | '1 year';

export const TOKEN_API_URL = 'https://api.astar.network/api';

export enum TitleTvlChar {
  Tvl = 'Total Value Locked',
  DappStaking = 'Total Value Locked in dApp Staking',
  Ecosystem = 'Total Value Locked in ecosystem',
}
