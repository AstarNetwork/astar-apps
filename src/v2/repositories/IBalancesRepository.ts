export interface IBalancesRepository {
  getTotalIssuance(blockNumber?: number): Promise<bigint>;
}
