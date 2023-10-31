import { inject, injectable } from 'inversify';
import { CombinedDappInfo } from '../models';
import { IDappStakingService } from './IDappStakingService';
import { Symbols } from 'src/v2/symbols';
import { IDappStakingRepository } from '../repositories';
import { Guard } from 'src/v2/common';
import { IWalletService } from 'src/v2/services';

@injectable()
export class DappStakingService implements IDappStakingService {
  constructor(
    @inject(Symbols.DappStakingRepositoryV3) private dappStakingRepository: IDappStakingRepository,
    @inject(Symbols.WalletFactory) private walletFactory: () => IWalletService
  ) {}

  // @inheritdoc
  public async getDapps(network: string): Promise<CombinedDappInfo[]> {
    Guard.ThrowIfUndefined(network, 'network');

    const [storeDapps, chainDapps] = await Promise.all([
      this.dappStakingRepository.getDapps(network.toLowerCase()),
      this.dappStakingRepository.getChainDapps(),
    ]);

    // Map on chain and in store dApps
    const dApps: CombinedDappInfo[] = [];
    chainDapps.forEach((chainDapp) => {
      const storeDapp = storeDapps.find((x) => x.address === chainDapp.address);
      if (storeDapp) {
        dApps.push({
          basic: storeDapp,
          chain: chainDapp,
        });
      }
    });

    return dApps;
  }

  public async lockAndStake(
    contractAddress: string,
    amount: number,
    senderAddress: string,
    successMessage: string
  ): Promise<void> {
    Guard.ThrowIfUndefined(contractAddress, 'contractAddress');

    const wallet = await this.walletFactory();
    const call = await this.dappStakingRepository.getLockAndStakeCall(contractAddress, amount);
    await wallet.signAndSend({
      extrinsic: call,
      senderAddress: senderAddress,
      successMessage,
    });
  }
}
