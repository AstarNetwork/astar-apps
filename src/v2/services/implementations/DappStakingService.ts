import { BN } from '@polkadot/util';
import { ethers } from 'ethers';
import { inject, injectable } from 'inversify';
import { astarMainnetNativeToken, ASTAR_NATIVE_TOKEN } from 'src/config/chain';
import { Guard } from 'src/v2/common';
import { TvlModel } from 'src/v2/models';
import { DappCombinedInfo, StakerInfo } from 'src/v2/models/DappsStaking';
import {
  IDappStakingRepository,
  IMetadataRepository,
  IPriceRepository,
  ISystemRepository,
} from 'src/v2/repositories';
import { IBalanceFormatterService, IDappStakingService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { IWalletService } from '../IWalletService';

@injectable()
export class DappStakingService implements IDappStakingService {
  private readonly wallet: IWalletService;

  constructor(
    @inject(Symbols.DappStakingRepository) private dappStakingRepository: IDappStakingRepository,
    @inject(Symbols.PriceRepository) private priceRepository: IPriceRepository,
    @inject(Symbols.MetadataRepository) private metadataRepository: IMetadataRepository,
    @inject(Symbols.SystemRepository) private systemRepository: ISystemRepository,
    @inject(Symbols.BalanceFormatterService) private balanceFormatter: IBalanceFormatterService,
    @inject(Symbols.WalletFactory) walletFactory: () => IWalletService
  ) {
    this.wallet = walletFactory();
    this.systemRepository.startBlockSubscription();
    this.dappStakingRepository.starEraSubscription();
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
    const tvlUsd = astarMainnetNativeToken.includes(metadata.token as ASTAR_NATIVE_TOKEN)
      ? tvlDefaultUnit * priceUsd
      : 0;

    return new TvlModel(tvl, tvlDefaultUnit, tvlUsd);
  }

  public async nominationTransfer({
    amount,
    fromContractId,
    targetContractId,
    address,
  }: {
    amount: BN;
    fromContractId: string;
    targetContractId: string;
    address: string;
  }): Promise<void> {
    Guard.ThrowIfUndefined('fromContractId', fromContractId);
    Guard.ThrowIfUndefined('targetContractId', targetContractId);
    Guard.ThrowIfUndefined('stakerAddress', address);

    const stakeCall = await this.dappStakingRepository.getNominationTransferCall({
      amount,
      fromContractId,
      targetContractId,
    });
    await this.wallet.signAndSend(
      stakeCall,
      address,
      `You successfully staked to ${targetContractId} from ${fromContractId}`
    );
  }

  public async stake(contractAddress: string, stakerAddress: string, amount: BN): Promise<void> {
    Guard.ThrowIfUndefined('contractAddress', contractAddress);
    Guard.ThrowIfUndefined('stakerAddress', stakerAddress);

    const stakeCall = await this.dappStakingRepository.getBondAndStakeCall(contractAddress, amount);
    await this.wallet.signAndSend(
      stakeCall,
      stakerAddress,
      `You successfully staked to ${contractAddress}`
    );
  }

  /**
   * Gets staker info (total staked, stakers count) for a given contracts.
   * @param contractAddresses List of contract addresses to provide info for.
   */
  public async getStakerInfo(
    contractAddresses: string[],
    walletAddress: string
  ): Promise<StakerInfo[]> {
    Guard.ThrowIfUndefined('contractAddresses', contractAddresses);

    const stakerInfos = await this.dappStakingRepository.getStakerInfo(
      contractAddresses,
      walletAddress
    );
    const metadata = await this.metadataRepository.getChainMetadata();

    return stakerInfos.map((x) => {
      x.totalStakeFormatted = this.balanceFormatter.format(x.totalStake, metadata.decimals);
      return x;
    });
  }

  public async getCombinedInfo(currentAccount: string): Promise<DappCombinedInfo[]> {
    Guard.ThrowIfUndefined('currentAccount', currentAccount);

    const dapps = await this.dappStakingRepository.getRegisteredDapps();
    const stakerInfo = await this.getStakerInfo(
      dapps.map((x) => x.address),
      currentAccount
    );

    return dapps.map((x, index) => {
      return new DappCombinedInfo(x, stakerInfo[index]);
    });
  }

  public async getRegisteredContract(developerAddress: string): Promise<string | undefined> {
    Guard.ThrowIfUndefined('developerAddress', developerAddress);

    return await this.dappStakingRepository.getRegisteredContract(developerAddress);
  }
}
