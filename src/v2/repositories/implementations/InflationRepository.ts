import {
  InflationConfiguration,
  PalletInflationActiveInflationConfig,
  PalletInflationInflationParams,
} from 'src/v2/models';
import { IInflationRepository } from '../IInflationRepository';
import { inject, injectable } from 'inversify';
import { Symbols } from 'src/v2/symbols';
import { IApi } from 'src/v2/integration';
import { InflationParam } from 'src/staking-v3';
import { BlockHash } from '@polkadot/types/interfaces';

@injectable()
export class InflationRepository implements IInflationRepository {
  constructor(@inject(Symbols.DefaultApi) private api: IApi) {}

  public async getInflationConfiguration(): Promise<InflationConfiguration> {
    const api = await this.api.getApi();
    const data =
      await api.query.inflation.activeInflationConfig<PalletInflationActiveInflationConfig>();

    return this.mapInflationConfiguration(data);
  }

  public async getInflationConfigurationAt(blockNumber: number): Promise<InflationConfiguration> {
    const api = await this.api.getApi();
    const blockHash = await api.rpc.chain.getBlockHash<BlockHash>(blockNumber);
    const apiAtBlock = await api.at(blockHash);
    const data =
      await apiAtBlock.query.inflation.activeInflationConfig<PalletInflationActiveInflationConfig>();

    return this.mapInflationConfiguration(data);
  }

  public async getInflationParams(): Promise<InflationParam> {
    const api = await this.api.getApi();
    const data = await api.query.inflation.inflationParams<PalletInflationInflationParams>();

    return {
      maxInflationRate: String(data.maxInflationRate),
      adjustableStakersPart: String(data.adjustableStakersPart),
      baseStakersPart: String(data.baseStakersPart),
      idealStakingRate: String(data.idealStakingRate),
    };
  }

  private mapInflationConfiguration(
    data: PalletInflationActiveInflationConfig
  ): InflationConfiguration {
    return {
      issuanceSafetyCap: data.issuanceSafetyCap.toBigInt(),
      collatorRewardPerBlock: data.collatorRewardPerBlock.toBigInt(),
      treasuryRewardPerBlock: data.treasuryRewardPerBlock.toBigInt(),
      dappRewardPoolPerEra: data.dappRewardPoolPerEra.toBigInt(),
      baseStakerRewardPoolPerEra: data.baseStakerRewardPoolPerEra.toBigInt(),
      adjustableStakerRewardPoolPerEra: data.adjustableStakerRewardPoolPerEra.toBigInt(),
      bonusRewardPoolPerPeriod: data.bonusRewardPoolPerPeriod.toBigInt(),
      idealStakingRate: Number(data.idealStakingRate.toBigInt() / BigInt('10000000000000000')),
    };
  }
}
