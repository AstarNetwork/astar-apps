import { BN } from '@polkadot/util';
import { Guard } from 'src/v2/common';

export class TvlModel {
  constructor(public tvl: string, public tvlDefaultUnit: number, public tvlUsd: number) {
    Guard.ThrowIfNegative('tvl', Number(tvl));
    Guard.ThrowIfNegative('tvlDefaultUnit', tvlDefaultUnit);
    Guard.ThrowIfNegative('tvlUsd', tvlUsd);
  }
}
