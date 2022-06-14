import { Guard } from 'src/v2/common';

export class ChainMetadata {
  constructor(public decimals: number, public token: string, public chain: string) {
    Guard.ThrowIfNegative('decimals', decimals);
    Guard.ThrowIfUndefined('token', token);
    Guard.ThrowIfUndefined('chain', chain);
  }
}
