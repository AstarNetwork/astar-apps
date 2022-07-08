import { AcalaXcmRepository, PolkadotXcmRepository } from 'src/v2/repositories/implementations';
import { Chain, TypeMapping } from '../types';

export const XcmRepositoryConfiguration: TypeMapping = {
  [Chain.Polkadot]: PolkadotXcmRepository,
  [Chain.Kusama]: PolkadotXcmRepository,
  [Chain.Acala]: AcalaXcmRepository,
  [Chain.Karura]: AcalaXcmRepository,
};
