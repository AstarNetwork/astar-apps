import { AcalaXcmRepository, AstarXcmRepository } from 'src/v2/repositories/implementations';
import { Chain, TypeMapping } from '../types';

export const XcmRepositoryConfiguration: TypeMapping = {
  [Chain.Astar]: AstarXcmRepository,
  [Chain.Shiden]: AstarXcmRepository,
  [Chain.Acala]: AcalaXcmRepository,
  [Chain.Karura]: AcalaXcmRepository,
};
