import { injectable, inject } from 'inversify';
import { Symbols } from 'src/v2/symbols';
import { IWalletService, WalletType, IAccountUnificationService } from 'src/v2/services';
import { IAccountUnificationRepository, ISystemRepository } from 'src/v2/repositories';
import { decodeAddress } from '@polkadot/util-crypto';
import { ExtrinsicStatusMessage, IEventAggregator } from 'src/v2/messaging';
import { Guard } from 'src/v2/common';
import { IdentityData } from 'src/v2/models';

@injectable()
export class AccountUnificationService implements IAccountUnificationService {
  constructor(
    @inject(Symbols.WalletFactory)
    private walletFactory: (walletType?: WalletType) => IWalletService,
    @inject(Symbols.SystemRepository) private systemRepo: ISystemRepository,
    @inject(Symbols.AccountUnificationRepository)
    private unificationRepo: IAccountUnificationRepository,
    @inject(Symbols.EventAggregator) private eventAggregator: IEventAggregator
  ) {}

  public async unifyAccounts(
    nativeAddress: string,
    evmAddress: string,
    accountName: string,
    avatarNftAddress?: string,
    avatarNftId?: string
  ): Promise<void> {
    try {
      const chainId = await this.systemRepo.getChainId();
      const genesisHash = await this.systemRepo.getBlockHash(0);
      const publicKey = decodeAddress(nativeAddress);

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
      const transaction = await this.unificationRepo.getUnifyAccountsBatchAllCall(
        nativeAddress,
        evmAddress,
        signedPayload,
        this.createIdentityData(accountName, avatarNftAddress, avatarNftId)
      );
      const polkadotWallet = this.walletFactory(WalletType.Polkadot);

      await polkadotWallet.signAndSend({
        extrinsic: transaction,
        senderAddress: nativeAddress,
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

  public async getMappedNativeAddress(evmAddress: string): Promise<string> {
    Guard.ThrowIfUndefined('evmAddress', evmAddress);

    return await this.unificationRepo.getMappedNativeAddress(evmAddress);
  }

  public async getMappedEvmAddress(nativeAddress: string): Promise<string> {
    Guard.ThrowIfUndefined('nativeAddress', nativeAddress);

    return await this.unificationRepo.getMappedEvmAddress(nativeAddress);
  }

  private createIdentityData(
    display: string,
    avatarNftAddress?: string,
    avatarNftId?: string
  ): IdentityData {
    const data = new IdentityData(display);

    if (avatarNftAddress && avatarNftId) {
      data.additional = [
        { key: 'avatarNftAddress', value: avatarNftAddress },
        { key: 'avatarNftId', value: avatarNftId },
      ];
    }

    return data;
  }
}
