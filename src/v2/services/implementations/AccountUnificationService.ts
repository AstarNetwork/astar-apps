import { injectable, inject } from 'inversify';
import { IAccountUnificationService } from '../IAccountUnificationService';
import { Symbols } from 'src/v2/symbols';
import { IWalletService, WalletType } from '../IWalletService';
import { ISystemRepository } from 'src/v2/repositories';

@injectable()
export class AccountUnificationService implements IAccountUnificationService {
  constructor(
    @inject(Symbols.WalletFactory)
    private walletFactory: (walletType?: WalletType) => IWalletService,
    @inject(Symbols.SystemRepository) private systemRepo: ISystemRepository
  ) {}

  public async unifyAccounts(ss58Address: string, h160Address: string): Promise<void> {
    const chainId = await this.systemRepo.getChainId();
    const genesisHash = await this.systemRepo.getBlockHash(0);

    const payload = [
      {
        chainId: chainId,
        name: 'Astar EVM Claim',
        version: '1',
        salt: genesisHash,
      },
      {
        Claim: [{ name: 'substrateAddress', type: 'bytes' }],
      },
      {
        ss58Address,
      },
    ];

    const wallet = this.walletFactory(WalletType.Metamask);

    throw new Error('Method not implemented yet.');
  }
}
