import { Erc20Token } from 'src/modules/token';
import { Asset, Chain } from 'src/v2/models';
import { XcmTokenInformation } from 'src/modules/xcm';
import { endpointKey } from 'src/config/chainEndpoints';
import { ASTAR_NATIVE_TOKEN } from 'src/config/chain';
import { ASTAR_DECIMALS } from '@astar-network/astar-sdk-core';

// Acala Note: There is no endpoint to get minBridgeAmount.  But the rule is that Acala doesn't allow transfers that are less value than the equivalent of $0.01USD

// Acala Note: minBridgeAmount should be more than ED
// Ref: https://wiki.acala.network/get-started/acala-network/acala-account
// Ref: https://wiki.acala.network/get-started/get-started/karura-account

export const xcmToken = {
  [endpointKey.ASTAR]: [
    {
      symbol: 'DOT',
      isNativeToken: true,
      assetId: '340282366920938463463374607431768211455',
      originAssetId: '',
      logo: require('/src/assets/img/token/dot.png'),
      isXcmCompatible: true,
      originChain: Chain.POLKADOT,
      minBridgeAmount: '1.1',
    },
    {
      symbol: 'ACA',
      isNativeToken: true,
      assetId: '18446744073709551616',
      originAssetId: 'ACA',
      logo: require('/src/assets/img/token/aca.png'),
      isXcmCompatible: true,
      originChain: Chain.ACALA,
      minBridgeAmount: '0.4',
    },
    {
      symbol: 'LDOT',
      isNativeToken: false,
      assetId: '18446744073709551618',
      originAssetId: 'LDOT',
      logo: require('/src/assets/img/token/ldot.png'),
      isXcmCompatible: true,
      originChain: Chain.ACALA,
      minBridgeAmount: '0.13',
    },
    {
      symbol: 'ASEED',
      isNativeToken: false,
      assetId: '18446744073709551617',
      originAssetId: 'AUSD',
      logo: require('/src/assets/img/token/aseed.png'),
      isXcmCompatible: true,
      originChain: Chain.ACALA,
      minBridgeAmount: '0.1',
    },
    {
      symbol: 'GLMR',
      isNativeToken: true,
      assetId: '18446744073709551619',
      originAssetId: 'GLMR',
      logo: require('/src/assets/img/token/glmr.png'),
      isXcmCompatible: true,
      originChain: Chain.MOONBEAM,
      minBridgeAmount: '0.2',
    },
    {
      symbol: 'USDT',
      isNativeToken: false,
      assetId: '4294969280',
      originAssetId: '1984',
      logo: require('/src/assets/img/token/usdt.png'),
      isXcmCompatible: true,
      originChain: Chain.ASSET_HUB,
      minBridgeAmount: '1.5',
    },
    {
      symbol: 'IBTC',
      isNativeToken: false,
      assetId: '18446744073709551620',
      originAssetId: 'IBTC',
      logo: require('/src/assets/img/token/ibtc.png'),
      isXcmCompatible: true,
      originChain: Chain.INTERLAY,
      minBridgeAmount: '0.00000237',
    },
    {
      symbol: 'INTR',
      isNativeToken: true,
      assetId: '18446744073709551621',
      originAssetId: 'INTR',
      logo: require('/src/assets/img/token/intr.png'),
      isXcmCompatible: true,
      originChain: Chain.INTERLAY,
      minBridgeAmount: '0.959',
    },
    {
      symbol: 'PHA',
      isNativeToken: true,
      assetId: '18446744073709551622',
      originAssetId: 'PHA',
      logo: require('/src/assets/img/token/pha.png'),
      isXcmCompatible: true,
      originChain: Chain.PHALA,
      minBridgeAmount: '0.2',
    },
    {
      symbol: 'BNC',
      isNativeToken: true,
      assetId: '18446744073709551623',
      originAssetId: 'BNC',
      logo: require('/src/assets/img/token/bnc.svg'),
      isXcmCompatible: true,
      originChain: Chain.BIFROST_POLKADOT,
      minBridgeAmount: '0.1',
    },
    {
      symbol: 'vDOT',
      isNativeToken: false,
      assetId: '18446744073709551624',
      originAssetId: 'vDOT',
      logo: require('/src/assets/img/token/vdot.svg'),
      isXcmCompatible: true,
      originChain: Chain.BIFROST_POLKADOT,
      minBridgeAmount: '0.1',
    },
    {
      symbol: 'EQD',
      isNativeToken: false,
      assetId: '18446744073709551629',
      originAssetId: 'EQD',
      logo: require('/src/assets/img/EQD.png'),
      isXcmCompatible: true,
      originChain: Chain.EQUILIBRIUM,
      minBridgeAmount: '0.2',
    },
    {
      symbol: 'UNQ',
      isNativeToken: true,
      assetId: '18446744073709551631',
      originAssetId: 'UNQ',
      logo: require('/src/assets/img/token/unq.svg'),
      isXcmCompatible: true,
      originChain: Chain.UNIQUE,
      minBridgeAmount: '0.1',
    },
    {
      symbol: 'vASTR',
      isNativeToken: false,
      assetId: '18446744073709551632',
      originAssetId: 'vASTR',
      logo: require('/src/assets/img/token/vastr.png'),
      isXcmCompatible: true,
      originChain: Chain.BIFROST_POLKADOT,
      minBridgeAmount: '0.1',
    },
  ],
  [endpointKey.SHIDEN]: [
    {
      symbol: 'KSM',
      isNativeToken: true,
      assetId: '340282366920938463463374607431768211455',
      originAssetId: '',
      logo: require('/src/assets/img/token/kusama.png'),
      isXcmCompatible: true,
      originChain: Chain.KUSAMA,
      minBridgeAmount: '0.1',
    },
    {
      symbol: 'ASEED',
      isNativeToken: false,
      assetId: '18446744073709551616',
      originAssetId: 'KUSD',
      logo: require('/src/assets/img/token/aseed.png'),
      isXcmCompatible: true,
      originChain: Chain.KARURA,
      minBridgeAmount: '0.1',
    },
    {
      symbol: 'KAR',
      isNativeToken: true,
      assetId: '18446744073709551618',
      originAssetId: 'KAR',
      logo: require('/src/assets/img/token/kar.png'),
      isXcmCompatible: true,
      originChain: Chain.KARURA,
      // ED: 0.1 KAR (Users can't withdraw 0.1KAR to 0 KAR account due to a fee)
      minBridgeAmount: '0.11',
    },
    {
      symbol: 'LKSM',
      isNativeToken: false,
      assetId: '18446744073709551619',
      originAssetId: 'LKSM',
      logo: require('/src/assets/img/token/lksm.png'),
      isXcmCompatible: true,
      originChain: Chain.KARURA,
      minBridgeAmount: '0.0024',
    },
    {
      symbol: 'MOVR',
      isNativeToken: true,
      assetId: '18446744073709551620',
      originAssetId: 'MOVR',
      logo: require('/src/assets/img/token/movr.png'),
      isXcmCompatible: true,
      originChain: Chain.MOONRIVER,
      minBridgeAmount: '0.007',
    },
    {
      symbol: 'USDT',
      isNativeToken: false,
      assetId: '4294969280',
      originAssetId: '1984',
      logo: require('/src/assets/img/token/usdt.png'),
      isXcmCompatible: true,
      originChain: Chain.ASSET_HUB_KUSAMA,
      minBridgeAmount: '0.1',
    },
    {
      symbol: 'KBTC',
      isNativeToken: false,
      assetId: '18446744073709551621',
      originAssetId: 'KBTC',
      logo: require('/src/assets/img/token/kbtc.png'),
      isXcmCompatible: true,
      originChain: Chain.KINTSUGI,
      minBridgeAmount: '0.00000237',
    },
    {
      symbol: 'KINT',
      isNativeToken: true,
      assetId: '18446744073709551622',
      originAssetId: 'KINT',
      logo: require('/src/assets/img/token/kint.png'),
      isXcmCompatible: true,
      originChain: Chain.KINTSUGI,
      minBridgeAmount: '0.345',
    },
    {
      symbol: 'CSM',
      isNativeToken: true,
      assetId: '18446744073709551624',
      originAssetId: 'CSM',
      logo: require('/src/assets/img/token/csm.svg'),
      isXcmCompatible: true,
      originChain: Chain.CRUST_SHADOW,
      minBridgeAmount: '0.5',
    },
    {
      symbol: 'PHA',
      isNativeToken: true,
      assetId: '18446744073709551623',
      originAssetId: 'PHA',
      logo: require('/src/assets/img/token/pha.png'),
      isXcmCompatible: true,
      originChain: Chain.KHALA,
      minBridgeAmount: '0.2',
    },
    {
      symbol: 'BNC',
      isNativeToken: true,
      assetId: '18446744073709551627',
      originAssetId: 'BNC',
      logo: require('/src/assets/img/token/bnc.svg'),
      isXcmCompatible: true,
      originChain: Chain.BIFROST_KUSAMA,
      minBridgeAmount: '0.1',
    },
    {
      symbol: 'vKSM',
      isNativeToken: false,
      assetId: '18446744073709551628',
      originAssetId: 'vKSM',
      logo: require('/src/assets/img/token/vksm.svg'),
      isXcmCompatible: true,
      originChain: Chain.BIFROST_KUSAMA,
      minBridgeAmount: '0.01',
    },
  ],
  [endpointKey.SHIBUYA]: [],
  [endpointKey.LOCAL]: [],
  [endpointKey.CUSTOM]: [],
  [endpointKey.ROCSTAR]: [],
  [endpointKey.ASTAR_ZKEVM]: [],
  [endpointKey.ZKATANA]: [],
};

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
  const name =
    symbol === 'ASTR'
      ? 'Astar'
      : symbol === 'SDN'
      ? 'Shiden'
      : symbol === 'ETH'
      ? 'Ethereum'
      : 'Shibuya';
  const tokenImage =
    symbol === 'ASTR'
      ? ASTR.logo
      : symbol === 'SDN'
      ? SDN.logo
      : symbol === 'ETH'
      ? ETH.logo
      : SBY.logo;
  const mappedERC20Addr = astarNativeTokenErcAddr;
  const metadata = {
    decimals: ASTAR_DECIMALS,
    deposit: '0',
    isFrozen: false,
    name,
    symbol,
  };
  const minBridgeAmount = symbol === 'ASTR' ? '5' : '1';
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
  const tokenImage = token.image || '';
  const mappedERC20Addr = t ? t.mappedERC20Addr : token.address;
  const metadata = {
    decimals: t ? t.metadata.decimals : token.decimal,
    deposit: '0',
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
  logo: require('src/assets/img/token/sdn.png'),
  isXcmCompatible: true,
  originChain: Chain.SHIDEN,
  minBridgeAmount: '0.1',
};

export const ASTR: XcmTokenInformation = {
  symbol: 'ASTR',
  isNativeToken: true,
  assetId: idAstarNativeToken,
  originAssetId: 'ASTR',
  logo: require('src/assets/img/token/astr.png'),
  isXcmCompatible: true,
  originChain: Chain.ASTAR,
  minBridgeAmount: '0.1',
};

export const SBY: XcmTokenInformation = {
  symbol: 'SBY',
  isNativeToken: true,
  assetId: idAstarNativeToken,
  originAssetId: 'SBY',
  logo: require('src/assets/img/token/astr.png'),
  isXcmCompatible: true,
  originChain: 'Shibuya',
  minBridgeAmount: '0.1',
};

export const ETH: XcmTokenInformation = {
  symbol: 'ETH',
  isNativeToken: true,
  assetId: idAstarNativeToken,
  originAssetId: 'ETH',
  logo: require('src/assets/img/ethereum.png'),
  isXcmCompatible: false,
  originChain: 'Shibuya',
  minBridgeAmount: '0.1',
};
