import {
  InflationConfiguration,
  PalletInflationActiveInflationConfig,
  PalletInflationInflationParameters,
} from 'src/v2/models';
import { IInflationRepository } from '../IInflationRepository';
import { inject, injectable } from 'inversify';
import { Symbols } from 'src/v2/symbols';
import { IApi } from 'src/v2/integration';
import { InflationParam } from 'src/staking-v3';
import { BlockHash, Perquintill } from '@polkadot/types/interfaces';
import { Compact } from '@polkadot/types';

const quntilToNumber = (value: Compact<Perquintill>): number =>
  Number(value.toHuman()?.toString().replace('%', '') ?? 0) / 100;

@injectable()
export class InflationRepository implements IInflationRepository {
  constructor(@inject(Symbols.DefaultApi) private api: IApi) {}

  public async getInflationConfiguration(block?: number): Promise<InflationConfiguration> {
    const api = await this.api.getApi(block);
    const data =
      await api.query.inflation.activeInflationConfig<PalletInflationActiveInflationConfig>();

    return this.mapInflationConfiguration(data);
  }

  public async getInflationConfigurationAt(blockNumber: number): Promise<InflationConfiguration> {
    const api = await this.api.getApi(blockNumber);
    const data =
      await api.query.inflation.activeInflationConfig<PalletInflationActiveInflationConfig>();

    return this.mapInflationConfiguration(data);
  }

  public async getInflationParams(block?: number): Promise<InflationParam> {
    const api = await this.api.getApi(block);
    const data = await api.query.inflation.inflationParams<PalletInflationInflationParameters>();

    return {
      maxInflationRate: quntilToNumber(data.maxInflationRate),
      adjustableStakersPart: quntilToNumber(data.adjustableStakersPart),
      baseStakersPart: quntilToNumber(data.baseStakersPart),
      idealStakingRate: quntilToNumber(data.idealStakingRate),
      treasuryPart: quntilToNumber(data.treasuryPart),
      collatorsPart: quntilToNumber(data.collatorsPart),
      dappsPart: quntilToNumber(data.dappsPart),
      bonusPart: quntilToNumber(data.bonusPart),
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
