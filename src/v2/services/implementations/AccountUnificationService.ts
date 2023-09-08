import { injectable, inject } from 'inversify';
import { IAccountUnificationService } from '../IAccountUnificationService';
import { Symbols } from 'src/v2/symbols';
import { IWalletService } from '../IWalletService';

@injectable()
export class AccountUnificationService implements IAccountUnificationService {
  constructor(@inject(Symbols.WalletFactory) walletFactory: () => IWalletService) {}

  async unifyAccounts(ss58Address: string, h160Address: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
