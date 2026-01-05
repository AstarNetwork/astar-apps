export enum AlertMsg {
  SUCCESS = 'Transaction successfully executed',
  ERROR = 'Transaction failed',
  COMPLETED_HASH = 'Completed at transaction hash',
  MINIMUM_BALANCE = 'You do not have enough tokens to pay the transaction fee',
}

export const REQUIRED_MINIMUM_BALANCE: number = 0.05;
export const REQUIRED_MINIMUM_BALANCE_ETH: number = 0.0005;
