import { AcalaXcmRepository, AstarXcmRepository } from 'src/v2/repositories/implementations';
import { Chain } from 'src/modules/xcm';
import { TypeMapping } from '../types';

export const XcmRepositoryConfiguration: TypeMapping = {
  [Chain.ASTAR]: AstarXcmRepository,
  [Chain.SHIDEN]: AstarXcmRepository,
  [Chain.ACALA]: AcalaXcmRepository,
  [Chain.KARURA]: AcalaXcmRepository,
};
