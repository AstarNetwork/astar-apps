import { injectable, inject } from 'inversify';
import { Symbols } from 'src/v2/symbols';
import { IWalletService, WalletType, IAccountUnificationService } from 'src/v2/services';
import { IAccountsRepository, ISystemRepository } from 'src/v2/repositories';
import { decodeAddress } from '@polkadot/util-crypto';
import { ExtrinsicStatusMessage, IEventAggregator } from 'src/v2/messaging';

@injectable()
export class AccountUnificationService implements IAccountUnificationService {
  constructor(
    @inject(Symbols.WalletFactory)
    private walletFactory: (walletType?: WalletType) => IWalletService,
    @inject(Symbols.SystemRepository) private systemRepo: ISystemRepository,
    @inject(Symbols.AccountsRepository) private accountsRepo: IAccountsRepository,
    @inject(Symbols.EventAggregator) private eventAggregator: IEventAggregator
  ) {}

  public async unifyAccounts(ss58Address: string, h160Address: string): Promise<void> {
    try {
      const chainId = await this.systemRepo.getChainId();
      const genesisHash = await this.systemRepo.getBlockHash(0);
      const publicKey = decodeAddress(ss58Address);

      const domain = {
        chainId: chainId,
        name: 'Astar EVM Claim',
        version: '1',
        salt: genesisHash,
      };
      const types = {
        Claim: [{ name: 'substrateAddress', type: 'bytes' }],
      };
      const value = {
        substrateAddress: publicKey,
      };

      // Sign payload with EVM account.
      const evmWallet = this.walletFactory(WalletType.Metamask);
      const signedPayload = await evmWallet.signPayload(domain, types, value);

      // Claim account with polkadot wallet.
      const transaction = await this.accountsRepo.getClaimEvmAccountCall(
        h160Address,
        signedPayload
      );
      const polkadotWallet = this.walletFactory(WalletType.Polkadot);

      await polkadotWallet.signAndSend({
        extrinsic: transaction,
        senderAddress: ss58Address,
      });
    } catch (error) {
      const e = error as Error;
      this.eventAggregator.publish(
        new ExtrinsicStatusMessage({
          success: false,
          message: e.toString(),
        })
      );
    }
  }
}
