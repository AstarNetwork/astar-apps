import { BN } from '@polkadot/util';
import { Guard } from '../common';

export class StakerInfo {
  public totalStakeFormatted?: string;

  constructor(public contractAddress: string, public totalStake: BN, public stakersCount: number) {}

  static createDefault(contractAddress: string): StakerInfo {
    Guard.ThrowIfUndefined('contractAddress', contractAddress);

    return new StakerInfo(contractAddress, new BN(0), 0);
  }
}
