export enum AlertMsg {
  SUCCESS = 'Transaction successfully executed',
  SUCCESS_MULTISIG = 'Multisig call is successfully initiated',
  ERROR = 'Transaction failed',
  ERROR_DUPLICATED_TX = 'Transaction failed due to duplicate transactions on PolkaSafe; please approve or reject them before creating a new transaction',
  COMPLETED_HASH = 'Completed at transaction hash',
  MINIMUM_BALANCE = 'You do not have enough tokens to pay the transaction fee',
}

export const REQUIRED_MINIMUM_BALANCE: number = 0.05;
