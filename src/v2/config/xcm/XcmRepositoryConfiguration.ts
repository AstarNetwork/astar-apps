import {
  AcalaXcmRepository,
  AstarXcmRepository,
  StatemintXcmRepository,
  MoonbeamXcmRepository,
  PolkadotXcmRepository,
  InterlayXcmRepository,
  CrustShadowXcmRepository,
  PhalaXcmRepository,
} from 'src/v2/repositories/implementations';
import { TypeMapping } from 'src/v2/config/types';

export const XcmRepositoryConfiguration: TypeMapping = {
  ['astar']: AstarXcmRepository,
  ['shiden']: AstarXcmRepository,
  ['acala']: AcalaXcmRepository,
  ['karura']: AcalaXcmRepository,
  ['statemine']: StatemintXcmRepository,
  ['statemint']: StatemintXcmRepository,
  ['moonbeam']: MoonbeamXcmRepository,
  ['moonriver']: MoonbeamXcmRepository,
  ['polkadot']: PolkadotXcmRepository,
  ['kusama']: PolkadotXcmRepository,
  ['kintsugi']: InterlayXcmRepository,
  ['interlay']: InterlayXcmRepository,
  ['crust shadow']: CrustShadowXcmRepository,
  ['khala']: PhalaXcmRepository,
  ['phala']: PhalaXcmRepository,
};

export type AstarToken = 'ASTR' | 'SDN';

export type AstarNativeToken = {
  [key in AstarToken]: string;
};
