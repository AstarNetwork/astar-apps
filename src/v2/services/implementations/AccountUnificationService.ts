import { injectable, inject } from 'inversify';
import { Symbols } from 'src/v2/symbols';
import {
  IWalletService,
  WalletType,
  IAccountUnificationService,
  IGasPriceProvider,
  IIdentityService,
} from 'src/v2/services';
import {
  IAccountUnificationRepository,
  IEthCallRepository,
  ISystemRepository,
} from 'src/v2/repositories';
import { decodeAddress } from '@polkadot/util-crypto';
import { IEventAggregator } from 'src/v2/messaging';
import { Guard } from 'src/v2/common';
import { MetamaskWalletService } from './MetamaskWalletService';

@injectable()
export class AccountUnificationService implements IAccountUnificationService {
  constructor(
    @inject(Symbols.WalletFactory)
    private walletFactory: (walletType?: WalletType) => IWalletService,
    @inject(Symbols.SystemRepository) private systemRepo: ISystemRepository,
    @inject(Symbols.AccountUnificationRepository)
    private unificationRepo: IAccountUnificationRepository,
    @inject(Symbols.EventAggregator) private eventAggregator: IEventAggregator,
    @inject(Symbols.EthCallRepository) private ethCallRepository: IEthCallRepository,
    @inject(Symbols.GasPriceProvider) private gasPriceProvider: IGasPriceProvider,
    @inject(Symbols.IdentityService) private identityService: IIdentityService
  ) {}

  public async unifyAccounts(
    nativeAddress: string,
    evmAddress: string,
    accountName: string,
    avatarNftAddress?: string,
    avatarNftId?: string
  ): Promise<boolean> {
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
      // TODO provide wallet name as the method parameter.
      const evmWallet = new MetamaskWalletService(
        this.systemRepo,
        this.ethCallRepository,
        this.eventAggregator,
        'metamask',
        this.gasPriceProvider
      );
      // const evmWallet = this.walletFactory(WalletType.Metamask);
      const signedPayload = await evmWallet.signPayload(domain, types, value);

      // Claim account with polkadot wallet.
      const transaction = await this.unificationRepo.getUnifyAccountsBatchAllCall(
        nativeAddress,
        evmAddress,
        signedPayload,
        this.identityService.createIdentityData(accountName, avatarNftAddress, avatarNftId)
      );
      const polkadotWallet = this.walletFactory(WalletType.Polkadot);

      await polkadotWallet.signAndSend({
        extrinsic: transaction,
        senderAddress: nativeAddress,
      });

      return true;
    } catch (error) {
      return false;
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

  // Memo: return mapped native address for evm address
  // 1. query in API
  // 2. convert the address by SDK in case the account hasn't been unified
  public async getConvertedNativeAddress(evmAddress: string): Promise<string> {
    Guard.ThrowIfUndefined('evmAddress', evmAddress);

    return await this.unificationRepo.getConvertedNativeAddress(evmAddress);
  }

  // Memo: return mapped EVM address for native address
  public async getConvertedEvmAddress(nativeAddress: string): Promise<string> {
    Guard.ThrowIfUndefined('nativeAddress', nativeAddress);

    return await this.unificationRepo.getConvertedEvmAddress(nativeAddress);
  }
  public async checkIsUnifiedAccount(address: string): Promise<boolean> {
    Guard.ThrowIfUndefined('address', address);

    return await this.unificationRepo.handleCheckIsUnifiedAccount(address);
  }
}
