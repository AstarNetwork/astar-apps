export type PeriodData = {
  dappAddress: string;
  rewardAmount: bigint;
  stakeAmount: bigint;
};

/**
 * Definition of repository for access token price.
 */
export interface ITokenApiRepository {
  /**
   * Gets current token price in USD.
   * @param tokenInfo Token information.
   */
  getUsdPrice(symbol: string): Promise<number>;

  /**
   * Gets dapp staking v3 statistics for the given period.
   * @param network Network name.
   * @param period Period number.
   */
  getStakingPeriodStatistics(network: string, period: number): Promise<PeriodData[]>;
}
