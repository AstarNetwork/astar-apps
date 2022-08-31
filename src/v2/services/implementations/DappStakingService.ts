import { ethers } from 'ethers';
import { inject, injectable } from 'inversify';
import { BN } from '@polkadot/util';
import { TvlModel } from 'src/v2/models';
import { IDappStakingRepository, IMetadataRepository, IPriceRepository } from 'src/v2/repositories';
import { Symbols } from 'src/v2/symbols';
import { IDappStakingService, IBalanceFormatterService } from 'src/v2/services';
import { Guard } from 'src/v2/common';
import { IWalletService } from '../IWalletService';
import { DappCombinedInfo, StakerInfo } from 'src/v2/models/DappsStaking';

@injectable()
export class DappStakingService implements IDappStakingService {
  private readonly wallet: IWalletService;

  constructor(
    @inject(Symbols.DappStakingRepository) private dappStakingRepository: IDappStakingRepository,
    @inject(Symbols.PriceRepository) private priceRepository: IPriceRepository,
    @inject(Symbols.MetadataRepository) private metadataRepository: IMetadataRepository,
    @inject(Symbols.BalanceFormatterService) private balanceFormatter: IBalanceFormatterService,
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

  /**
   * Gets staker info (total staked, stakers count) for a given contracts.
   * @param contractAddresses List of contract addresses to provide info for.
   */
  public async getStakerInfo(contractAddresses: string[]): Promise<StakerInfo[]> {
    Guard.ThrowIfUndefined('contractAddresses', contractAddresses);

    const stakerInfos = await this.dappStakingRepository.getStakerInfo(contractAddresses);
    const metadata = await this.metadataRepository.getChainMetadata();

    return stakerInfos.map((x) => {
      x.totalStakeFormatted = this.balanceFormatter.format(x.totalStake, metadata.decimals);
      return x;
    });
  }

  public async getCombinedInfo(): Promise<DappCombinedInfo[]> {
    const dapps = await this.dappStakingRepository.getRegisteredDapps();
    const stakerInfo = await this.dappStakingRepository.getStakerInfo(dapps.map((x) => x.address));

    return dapps.map((x, index) => {
      return new DappCombinedInfo(x, stakerInfo[index]);
    });
  }
}
