/**
 * Support for v2 ledger stakers to enable them to unlock and withdraw their tokens.
 */
export interface IDappStakingServiceV2Ledger {
  unlock(senderAddress: string, amount: bigint, successMessage: string): Promise<void>;

  withdraw(senderAddress: string, successMessage: string): Promise<void>;
}
