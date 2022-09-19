import {
  AcalaXcmRepository,
  AstarXcmRepository,
  StatemintXcmRepository,
  MoonbeamXcmRepository,
  PolkadotXcmRepository,
} from 'src/v2/repositories/implementations';
import { Chain } from 'src/modules/xcm';
import { TypeMapping } from 'src/v2/config/types';

export const XcmRepositoryConfiguration: TypeMapping = {
  [Chain.ASTAR]: AstarXcmRepository,
  [Chain.SHIDEN]: AstarXcmRepository,
  [Chain.ACALA]: AcalaXcmRepository,
  [Chain.KARURA]: AcalaXcmRepository,
  [Chain.STATEMINE]: StatemintXcmRepository,
  [Chain.MOONBEAM]: MoonbeamXcmRepository,
  [Chain.MOONRIVER]: MoonbeamXcmRepository,
  [Chain.POLKADOT]: PolkadotXcmRepository,
  [Chain.KUSAMA]: PolkadotXcmRepository,
};
