import { TvlModel } from 'src/v2/models';

export interface IDappStakingService {
  getTvl(): Promise<TvlModel>;
}
