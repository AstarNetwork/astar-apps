import { BN } from '@polkadot/util';

export interface ChunkInfo {
  amount: BN;
  unlockEra: BN;
  erasBeforeUnlock: number;
}

export interface AccountLedger {
  locked: BN;
  unbondingInfo: {
    unlockingChunks: ChunkInfo[];
  };
}
