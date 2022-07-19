import { ethers } from 'ethers';
import { inject, injectable } from 'inversify';
import { BN } from '@polkadot/util';
import { TvlModel } from 'src/v2/models';
import { IDappStakingRepository, IMetadataRepository, IPriceRepository } from 'src/v2/repositories';
import { Symbols } from 'src/v2/symbols';
import { IDappStakingService } from 'src/v2/services';
import { Guard } from 'src/v2/common';
import { IWalletService } from '../IWalletService';

@injectable()
export class DappStakingService implements IDappStakingService {
  private readonly wallet: IWalletService;

  constructor(
    @inject(Symbols.DappStakingRepository) private dappStakingRepository: IDappStakingRepository,
    @inject(Symbols.PriceRepository) private priceRepository: IPriceRepository,
    @inject(Symbols.MetadataRepository) private metadataRepository: IMetadataRepository,
    @inject(Symbols.WalletFactory) walletFactory: () => IWalletService
  ) {
    this.wallet = walletFactory();
  }

  public async getTvl(): Promise<TvlModel> {
    const metadata = await this.metadataRepository.getChainMetadata();
    const [tvl, priceUsd] = await Promise.all([
      this.dappStakingRepository.getTvl(),
      this.priceRepository.getUsdPrice(metadata.token),
    ]);

    const tvlDefaultUnit = Number(
      ethers.utils.formatUnits(BigInt(tvl.toString()), metadata.decimals)
    );
    const tvlUsd = tvlDefaultUnit * priceUsd;

    return new TvlModel(tvl, tvlDefaultUnit, tvlUsd);
  }

  public async stake(contractAddress: string, stakerAddress: string, amount: BN): Promise<void> {
    Guard.ThrowIfUndefined('contractAddress', contractAddress);
    Guard.ThrowIfUndefined('stakerAddress', stakerAddress);
    Guard.ThrowIfNegative('amount', amount);

    const stakeCall = await this.dappStakingRepository.getBondAndStakeCall(contractAddress, amount);
    this.wallet.signAndSend(
      stakeCall,
      stakerAddress,
      `You successfully staked to ${contractAddress}`
    );
  }
}
