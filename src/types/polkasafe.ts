import { Polkasafe } from 'polkasafe';

export class PolkasafeWrapper extends Polkasafe {
  public getAddress(): string {
    return this.address;
  }
}
