import { XcmTokenInformation } from 'src/modules/xcm';
import { ASTAR_NATIVE_TOKEN, endpointKey } from 'src/config/chainEndpoints';
import { ASTAR_DECIMALS } from 'src/hooks/helper/plasmUtils';

// Acala Note: There is no endpoint to get minBridgeAmount.  But the rule is that Acala doesn't allow transfers that are less value than the equivalent of $0.01USD
// Ref: https://www.notion.so/astarnetwork/HRMP-Portal-Support-for-Acala-Karura-UI-2eaab2e1d93c4e0f90609ea7039942a9#5c5a40f95c7b4c93a201feef233cb0fa

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
    {
      symbol: 'ACA',
      isNativeToken: true,
      assetId: '18446744073709551616',
      originAssetId: 'ACA',
      logo: 'https://assets.coingecko.com/coins/images/20634/small/upOKBONH_400x400.jpg?1647420536',
      isXcmCompatible: true,
      originChain: 'Acala',
      minBridgeAmount: '0.4',
    },
    {
      symbol: 'LDOT',
      isNativeToken: false,
      assetId: '18446744073709551618',
      originAssetId: 'LDOT',
      logo: 'https://assets.coingecko.com/coins/images/25847/small/iShot2022-06-02_13.14.07-removebg-preview.png?1654146888',
      isXcmCompatible: true,
      originChain: 'Acala',
      minBridgeAmount: '0.13',
    },
    {
      symbol: 'AUSD',
      isNativeToken: false,
      assetId: '18446744073709551617',
      originAssetId: 'AUSD',
      logo: 'https://assets.coingecko.com/coins/images/25812/small/ezgif-1-f4612f5260.png?1653987299',
      isXcmCompatible: true,
      originChain: 'Acala',
      minBridgeAmount: '0.0193',
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
  [endpointKey.LOCAL]: [],
  [endpointKey.CUSTOM]: [],
};

// Memo: placeholder for assetId of ASTR/SDN/SBY
export const idAstarNativeToken = '0000000000000000000';

export const generateAstarNativeTokenObject = (symbol: ASTAR_NATIVE_TOKEN) => {
  const name = symbol === 'ASTR' ? 'Astar' : symbol === 'SDN' ? 'Shiden' : 'Shibuya';
  const tokenImage = symbol === 'ASTR' ? ASTR.logo : symbol === 'SDN' ? SDN.logo : SBY.logo;
  return {
    accounts: '',
    admin: '',
    approvals: '',
    deposit: '',
    freezer: '',
    id: idAstarNativeToken,
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
    tokenImage,
    isNativeToken: true,
    isXcmCompatible: true,
  };
};

export const SDN: XcmTokenInformation = {
  symbol: 'SDN',
  isNativeToken: true,
  assetId: idAstarNativeToken,
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
  assetId: idAstarNativeToken,
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
  assetId: idAstarNativeToken,
  originAssetId: 'SBY',
  logo: require('src/assets/img/astr-token.png'),
  isXcmCompatible: true,
  originChain: 'Shibuya',
  minBridgeAmount: '0.1',
  parachains: [''],
};

export const xcmAstarNativeToken = { SDN, ASTR, SBY };
