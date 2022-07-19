import 'reflect-metadata';
import { BN } from '@polkadot/util';
import { BalanceFormatterService } from 'src/v2/services/implementations/BalanceFormatterService';

describe('BalanceFormatterService.ts', () => {
  it('formats balance', () => {
    const sut = new BalanceFormatterService();

    const result = sut.format(new BN('10000'), 3);
    const result2 = sut.format(new BN('12300000000'), 10);

    expect(result).toStrictEqual('10.0');
    expect(result2).toStrictEqual('1.23');
  });
  it('throws error if invalid arguments', () => {
    const sut = new BalanceFormatterService();

    expect(() => sut.format(new BN(0), -1)).toThrow('Invalid argument decimals');
  });
});
