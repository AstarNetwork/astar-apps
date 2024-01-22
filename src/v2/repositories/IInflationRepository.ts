import { InflationParam } from 'src/staking-v3';
import { InflationConfiguration } from '../models';

export interface IInflationRepository {
  getInflationConfiguration(): Promise<InflationConfiguration>;

  getInflationParams(): Promise<InflationParam>;
}
