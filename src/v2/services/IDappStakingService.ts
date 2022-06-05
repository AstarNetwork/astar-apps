import { TvlModel } from '../models/TvlModel';

export interface IDappStakingService {
  getTvl(): Promise<TvlModel>;
}
