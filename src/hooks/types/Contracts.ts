import type { AbiMessage, ContractCallOutcome } from '@polkadot/api-contract/types';

export interface CallResult extends ContractCallOutcome {
  from: string;
  message: AbiMessage;
  params: any[];
  when: Date;
}

export interface ContractLink {
  blockHash: string;
  blockNumber: string;
  contractId: string;
}
