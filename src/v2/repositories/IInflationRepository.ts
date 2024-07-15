import { InflationParam } from 'src/staking-v3';
import { InflationConfiguration } from '../models';

export interface IInflationRepository {
  getInflationConfiguration(block?: number): Promise<InflationConfiguration>;

  getInflationConfigurationAt(blockNumber: number): Promise<InflationConfiguration>;

  getInflationParams(block?: number): Promise<InflationParam>;
}
