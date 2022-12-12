import { Erc20Token } from 'src/modules/token';
import { Asset } from 'src/v2/models';
import { XcmTokenInformation } from 'src/modules/xcm';
import { endpointKey } from 'src/config/chainEndpoints';
import { ASTAR_DECIMALS } from 'src/hooks/helper/plasmUtils';
import { BN } from '@polkadot/util';
import { ASTAR_NATIVE_TOKEN } from 'src/config/chain';
import axios from 'axios';

// Acala Note: There is no endpoint to get minBridgeAmount.  But the rule is that Acala doesn't allow transfers that are less value than the equivalent of $0.01USD

// Acala Note: minBridgeAmount should be more than ED
// Ref: https://wiki.acala.network/get-started/acala-network/acala-account
// Ref: https://wiki.acala.network/get-started/get-started/karura-account

interface XcmTokenObj {
  [key: string]: XcmTokenInformation[];
}

let xcmToken: XcmTokenObj = {};
export { xcmToken };

export const getXcmTokens = async (): Promise<XcmTokenObj> => {
  const url =
    'https://cors-anywhere.herokuapp.com/https://token-resources-chi.vercel.app/api/tokens';
  const result = await axios.get<XcmTokenObj>(url);
  console.log('result.data', result.data);

  xcmToken[endpointKey.ASTAR] = result.data;
  return xcmToken;
};

// export const xcmToken = {
//   [endpointKey.ASTAR]: [
//     {
//       symbol: 'DOT',
//       isNativeToken: true,
//       assetId: '340282366920938463463374607431768211455',
//       originAssetId: '',
//       logo: require('/src/assets/img/ic_dot.png'),
//       isXcmCompatible: true,
//       originChain: 'polkadot',
//       minBridgeAmount: '1.1',
//     },
//     {
//       symbol: 'ACA',
//       isNativeToken: true,
//       assetId: '18446744073709551616',
//       originAssetId: 'ACA',
//       logo: 'https://assets.coingecko.com/coins/images/20634/small/upOKBONH_400x400.jpg?1647420536',
//       isXcmCompatible: true,
//       originChain: 'acala',
//       minBridgeAmount: '0.4',
//     },
//     {
//       symbol: 'LDOT',
//       isNativeToken: false,
//       assetId: '18446744073709551618',
//       originAssetId: 'LDOT',
//       logo: 'https://assets.coingecko.com/coins/images/25847/small/iShot2022-06-02_13.14.07-removebg-preview.png?1654146888',
//       isXcmCompatible: true,
//       originChain: 'acala',
//       minBridgeAmount: '0.13',
//     },
//     {
//       symbol: 'AUSD',
//       isNativeToken: false,
//       assetId: '18446744073709551617',
//       originAssetId: 'AUSD',
//       logo: 'https://assets.coingecko.com/coins/images/25812/small/ezgif-1-f4612f5260.png?1653987299',
//       isXcmCompatible: true,
//       originChain: 'acala',
//       minBridgeAmount: '0.1',
//     },
//     {
//       symbol: 'GLMR',
//       isNativeToken: true,
//       assetId: '18446744073709551619',
//       originAssetId: 'GLMR',
//       logo: 'https://assets.coingecko.com/coins/images/22459/small/glmr.png?1641880985',
//       isXcmCompatible: true,
//       originChain: 'moonbeam',
//       minBridgeAmount: '0.2',
//     },
//     {
//       symbol: 'USDT',
//       isNativeToken: false,
//       assetId: '4294969280',
//       originAssetId: '1984',
//       logo: 'https://assets.coingecko.com/coins/images/325/small/Tether-logo.png?1598003707',
//       isXcmCompatible: true,
//       originChain: 'statemint',
//       minBridgeAmount: '0.21',
//     },
//     {
//       symbol: 'IBTC',
//       isNativeToken: false,
//       assetId: '18446744073709551620',
//       originAssetId: 'IBTC',
//       logo: 'https://assets.coingecko.com/coins/images/26217/small/interBTC_for_Exchanges.png?1656578114',
//       isXcmCompatible: true,
//       originChain: 'interlay',
//       minBridgeAmount: '0.00000237',
//     },
//     {
//       symbol: 'INTR',
//       isNativeToken: true,
//       assetId: '18446744073709551621',
//       originAssetId: 'INTR',
//       logo: 'https://assets.coingecko.com/coins/images/26180/small/Interlay-Coinbase-2.png?1656382486',
//       isXcmCompatible: true,
//       originChain: 'interlay',
//       minBridgeAmount: '0.959',
//     },
//   ],
//   [endpointKey.SHIDEN]: [
//     {
//       symbol: 'KSM',
//       isNativeToken: true,
//       assetId: '340282366920938463463374607431768211455',
//       originAssetId: '',
//       logo: require('/src/assets/img/ic_kusama.png'),
//       isXcmCompatible: true,
//       originChain: 'kusama',
//       minBridgeAmount: '0.1',
//     },
//     {
//       symbol: 'AUSD',
//       isNativeToken: false,
//       assetId: '18446744073709551616',
//       originAssetId: 'KUSD',
//       logo: 'https://assets.coingecko.com/coins/images/25812/small/ezgif-1-f4612f5260.png?1653987299',
//       isXcmCompatible: true,
//       originChain: 'karura',
//       minBridgeAmount: '0.1',
//     },
//     {
//       symbol: 'KAR',
//       isNativeToken: true,
//       assetId: '18446744073709551618',
//       originAssetId: 'KAR',
//       logo: 'https://assets.coingecko.com/coins/images/17172/small/karura.jpeg?1626782066',
//       isXcmCompatible: true,
//       originChain: 'karura',
//       // ED: 0.1 KAR (Users can't withdraw 0.1KAR to 0 KAR account due to a fee)
//       minBridgeAmount: '0.11',
//     },
//     {
//       symbol: 'LKSM',
//       isNativeToken: false,
//       assetId: '18446744073709551619',
//       originAssetId: 'LKSM',
//       logo: 'https://resources.acala.network/tokens/LKSM.png',
//       isXcmCompatible: true,
//       originChain: 'karura',
//       minBridgeAmount: '0.0024',
//     },
//     {
//       symbol: 'MOVR',
//       isNativeToken: true,
//       assetId: '18446744073709551620',
//       originAssetId: 'MOVR',
//       logo: 'https://assets.coingecko.com/coins/images/17984/small/9285.png?1630028620',
//       isXcmCompatible: true,
//       originChain: 'moonriver',
//       minBridgeAmount: '0.007',
//     },
//     {
//       symbol: 'USDT',
//       isNativeToken: false,
//       assetId: '4294969280',
//       originAssetId: '1984',
//       logo: 'https://assets.coingecko.com/coins/images/325/small/Tether-logo.png?1598003707',
//       isXcmCompatible: true,
//       originChain: 'statemine',
//       minBridgeAmount: '0.1',
//     },
//     {
//       symbol: 'KBTC',
//       isNativeToken: false,
//       assetId: '18446744073709551621',
//       originAssetId: 'KBTC',
//       logo: 'https://assets.coingecko.com/coins/images/25816/small/jKEvMy-9_400x400.jpeg?1653990781',
//       isXcmCompatible: true,
//       originChain: 'kintsugi',
//       minBridgeAmount: '0.00000237',
//     },
//     {
//       symbol: 'KINT',
//       isNativeToken: true,
//       assetId: '18446744073709551622',
//       originAssetId: 'KINT',
//       logo: 'https://assets.coingecko.com/coins/images/22045/small/Kintsugi_logo-150x150.jpeg?1640675060',
//       isXcmCompatible: true,
//       originChain: 'kintsugi',
//       minBridgeAmount: '0.345',
//     },
//     {
//       symbol: 'PHA',
//       isNativeToken: true,
//       assetId: '18446744073709551623',
//       originAssetId: 'PHA',
//       logo: 'https://assets.coingecko.com/coins/images/12451/small/phala.png?1600061318',
//       isXcmCompatible: true,
//       originChain: 'khala',
//       minBridgeAmount: '0.2',
//     },
//   ],
//   [endpointKey.SHIBUYA]: [],
//   [endpointKey.LOCAL]: [],
//   [endpointKey.CUSTOM]: [],
// };

// Memo: placeholder for assetId of ASTR/SDN/SBY
export const idAstarNativeToken = '0000000000000000000';
export const astarNativeTokenErcAddr = '0x0000000000000000000000000000000000000000';

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
    mappedERC20Addr: astarNativeTokenErcAddr,
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

export const generateNativeAsset = (symbol: ASTAR_NATIVE_TOKEN): Asset => {
  const name = symbol === 'ASTR' ? 'Astar' : symbol === 'SDN' ? 'Shiden' : 'Shibuya';
  const tokenImage = symbol === 'ASTR' ? ASTR.logo : symbol === 'SDN' ? SDN.logo : SBY.logo;
  const mappedERC20Addr = astarNativeTokenErcAddr;
  const metadata = {
    decimals: ASTAR_DECIMALS,
    deposit: new BN(0),
    isFrozen: false,
    name,
    symbol,
  };
  const minBridgeAmount = '0.1';
  const originChain = name;
  const originAssetId = symbol;
  const isNativeToken = true;
  const isXcmCompatible = true;
  const userBalance = 0;

  return new Asset(
    idAstarNativeToken,
    mappedERC20Addr,
    metadata,
    minBridgeAmount,
    originChain,
    originAssetId,
    tokenImage,
    isNativeToken,
    isXcmCompatible,
    userBalance
  );
};

export const generateAssetFromEvmToken = (token: Erc20Token, xcmAssets: Asset[]): Asset => {
  const t = xcmAssets.find((it) => it.mappedERC20Addr === token.address);
  const name = t ? t.metadata.name : token.name;
  const tokenImage = token.image;
  const mappedERC20Addr = t ? t.mappedERC20Addr : token.address;
  const metadata = {
    decimals: t ? t.metadata.decimals : token.decimal,
    deposit: new BN(0),
    isFrozen: false,
    name,
    symbol: t ? t.metadata.symbol : token.symbol,
  };
  const minBridgeAmount = t ? t.minBridgeAmount : '0.1';
  const originChain = t ? t.originChain : '';
  const originAssetId = t ? t.originAssetId : token.symbol;
  const isNativeToken = t ? t.isNativeToken : false;
  const isXcmCompatible = t ? t.isXcmCompatible : false;

  return new Asset(
    idAstarNativeToken,
    mappedERC20Addr,
    metadata,
    minBridgeAmount,
    originChain,
    originAssetId,
    tokenImage,
    isNativeToken,
    isXcmCompatible,
    Number(token.userBalance)
  );
};

export const SDN: XcmTokenInformation = {
  symbol: 'SDN',
  isNativeToken: true,
  assetId: idAstarNativeToken,
  originAssetId: 'SDN',
  logo: require('src/assets/img/sdn-token.png'),
  isXcmCompatible: true,
  originChain: 'shiden',
  minBridgeAmount: '0.1',
};

export const ASTR: XcmTokenInformation = {
  symbol: 'ASTR',
  isNativeToken: true,
  assetId: idAstarNativeToken,
  originAssetId: 'ASTR',
  logo: require('src/assets/img/astr-token.png'),
  isXcmCompatible: true,
  originChain: 'astar',
  minBridgeAmount: '0.1',
};

export const SBY: XcmTokenInformation = {
  symbol: 'ASTR',
  isNativeToken: true,
  assetId: idAstarNativeToken,
  originAssetId: 'SBY',
  logo: require('src/assets/img/astr-token.png'),
  isXcmCompatible: true,
  originChain: 'shibuya',
  minBridgeAmount: '0.1',
};
