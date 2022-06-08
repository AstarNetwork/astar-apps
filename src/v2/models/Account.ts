import { Guard } from 'src/v2/common';

export class Account {
  constructor(
    public address: string,
    public genesisHash?: string | null | undefined,
    public name?: string,
    public source?: string
  ) {
    Guard.ThrowIfUndefined('address', address);
  }
}
