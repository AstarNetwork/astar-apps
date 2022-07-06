import { XcmTokenInformation } from 'src/modules/xcm';
import { endpointKey } from 'src/config/chainEndpoints';
import { ASTAR_DECIMALS } from 'src/hooks/helper/plasmUtils';

export const xcmToken = {
  [endpointKey.ASTAR]: [
    {
      symbol: 'DOT',
      isNativeToken: true,
      assetId: '340282366920938463463374607431768211455',
      originAssetId: '',
      logo: require('/src/assets/img/ic_dot.png'),
      isXcmCompatible: true,
      originChain: 'Polkadot',
      minBridgeAmount: '1.1',
    },
  ],
  [endpointKey.SHIDEN]: [
    {
      symbol: 'KSM',
      isNativeToken: true,
      assetId: '340282366920938463463374607431768211455',
      originAssetId: '',
      logo: require('/src/assets/img/ic_kusama.png'),
      isXcmCompatible: true,
      originChain: 'Kusama',
      minBridgeAmount: '0.1',
    },
    {
      symbol: 'AUSD',
      isNativeToken: false,
      assetId: '18446744073709551616',
      originAssetId: 'KUSD',
      logo: 'https://assets.coingecko.com/coins/images/25812/small/ezgif-1-f4612f5260.png?1653987299',
      isXcmCompatible: true,
      originChain: 'Karura',
      minBridgeAmount: '0.0193',
    },
    {
      symbol: 'KAR',
      isNativeToken: true,
      assetId: '18446744073709551618',
      originAssetId: 'KAR',
      logo: 'https://assets.coingecko.com/coins/images/17172/small/karura.jpeg?1626782066',
      isXcmCompatible: true,
      originChain: 'Karura',
      minBridgeAmount: '0.004948',
    },
    {
      symbol: 'LKSM',
      isNativeToken: false,
      assetId: '18446744073709551619',
      originAssetId: 'LKSM',
      logo: 'https://resources.acala.network/tokens/LKSM.png',
      isXcmCompatible: true,
      originChain: 'Karura',
      minBridgeAmount: '0.0024',
    },
  ],
  [endpointKey.SHIBUYA]: [],
};

export const idAstarNativePlaceholder = '0000000000000000000';

export const generateAstarNativeTokenObject = (symbol: string) => {
  const name = symbol === 'ASTR' ? 'Astar' : symbol === 'SDN' ? 'Shiden' : 'Shibuya';
  return {
    accounts: '',
    admin: '',
    approvals: '',
    deposit: '',
    freezer: '',
    id: idAstarNativePlaceholder,
    isFrozen: false,
    isSufficient: true,
    issuer: '',
    mappedERC20Addr: '0x0000000000000000000000000000000000000000',
    metadata: {
      decimals: String(ASTAR_DECIMALS),
      deposit: '0',
      isFrozen: false,
      name,
      symbol,
    },
    minBalance: '0.1',
    minBridgeAmount: '0.1',
    originAssetId: symbol,
    originChain: name,
    owner: '',
    sufficients: '',
    supply: '',
    userBalance: '0',
    userBalanceUsd: '0',
  };
};

export const SDN: XcmTokenInformation = {
  symbol: 'SDN',
  isNativeToken: true,
  assetId: idAstarNativePlaceholder,
  originAssetId: 'SDN',
  logo: require('src/assets/img/sdn-token.png'),
  isXcmCompatible: true,
  originChain: 'Shiden',
  minBridgeAmount: '0.1',
  parachains: ['Karura'],
};

export const ASTR: XcmTokenInformation = {
  symbol: 'ASTR',
  isNativeToken: true,
  assetId: idAstarNativePlaceholder,
  originAssetId: 'ASTR',
  logo: require('src/assets/img/astr-token.png'),
  isXcmCompatible: true,
  originChain: 'Astar',
  minBridgeAmount: '0.1',
  parachains: ['Acala'],
};

export const SBY: XcmTokenInformation = {
  symbol: 'ASTR',
  isNativeToken: true,
  assetId: idAstarNativePlaceholder,
  originAssetId: 'SBY',
  logo: require('src/assets/img/astr-token.png'),
  isXcmCompatible: true,
  originChain: 'Shibuya',
  minBridgeAmount: '0.1',
  parachains: [''],
};

export const xcmAstarNativeToken = { SDN, ASTR, SBY };
