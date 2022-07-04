import { BN } from '@polkadot/util';
import { ethers } from 'ethers';
import { injectable } from 'inversify';
import { Guard } from 'src/v2/common';
import { IBalanceFormatterService } from 'src/v2/services';

@injectable()
export class BalanceFormatterService implements IBalanceFormatterService {
  format(balance: BN, decimals: number): string {
    Guard.ThrowIfNegative('decimals', decimals);

    return ethers.utils.formatUnits(balance.toString(), decimals);
  }
}
