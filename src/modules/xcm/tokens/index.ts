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
  [key: string]: XcmTokenInformation;
}

interface XcmTokenObjArr {
  [key: string]: XcmTokenInformation[];
}

let xcmToken: XcmTokenObjArr = {};
export { xcmToken };

export const getXcmTokens = async (): Promise<XcmTokenObjArr> => {
  const url = 'https://token-resources-chi.vercel.app/api/tokens';
  const result = await axios.get<XcmTokenObj>(url);

  xcmToken[endpointKey.ASTAR] = [];
  xcmToken[endpointKey.SHIDEN] = [];
  for (const [key, value] of Object.entries(result.data)) {
    if (value.astarAssetId) {
      if (value.targetChain && value.targetChain.includes('astar')) {
        let tokenResult = JSON.parse(JSON.stringify(value));
        tokenResult.originChain = Array.isArray(tokenResult.originChain)
          ? tokenResult.originChain[endpointKey.ASTAR]
          : tokenResult.originChain;
        tokenResult.astarAssetId = Array.isArray(tokenResult.astarAssetId)
          ? tokenResult.astarAssetId[endpointKey.ASTAR]
          : tokenResult.astarAssetId;
        xcmToken[endpointKey.ASTAR].push(tokenResult);
      }
      if (value.targetChain && value.targetChain.includes('shiden')) {
        let tokenResult = JSON.parse(JSON.stringify(value));
        tokenResult.originChain = Array.isArray(tokenResult.originChain)
          ? tokenResult.originChain[endpointKey.SHIDEN]
          : tokenResult.originChain;
        tokenResult.astarAssetId = Array.isArray(tokenResult.astarAssetId)
          ? tokenResult.astarAssetId[endpointKey.SHIDEN]
          : tokenResult.astarAssetId;
        xcmToken[endpointKey.SHIDEN].push(tokenResult);
      }
    }
  }

  console.log('xcmToken', xcmToken);
  return xcmToken;
};

// Memo: placeholder for assetId of ASTR/SDN/SBY
export const idAstarNativeToken = '0000000000000000000';
export const astarNativeTokenErcAddr = '0x0000000000000000000000000000000000000000';

export const generateAstarNativeTokenObject = (symbol: ASTAR_NATIVE_TOKEN) => {
  const name = symbol === 'ASTR' ? 'Astar' : symbol === 'SDN' ? 'Shiden' : 'Shibuya';
  const tokenImage = symbol === 'ASTR' ? ASTR.icon : symbol === 'SDN' ? SDN.icon : SBY.icon;
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
  const tokenImage = symbol === 'ASTR' ? ASTR.icon : symbol === 'SDN' ? SDN.icon : SBY.icon;
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
  astarAssetId: idAstarNativeToken,
  originAssetId: 'SDN',
  icon: require('src/assets/img/sdn-token.png'),
  isXcmCompatible: true,
  originChain: 'shiden',
  targetChain: ['karura'],
  minBridgeAmount: '0.1',
};

export const ASTR: XcmTokenInformation = {
  symbol: 'ASTR',
  isNativeToken: true,
  astarAssetId: idAstarNativeToken,
  originAssetId: 'ASTR',
  icon: require('src/assets/img/astr-token.png'),
  isXcmCompatible: true,
  originChain: 'astar',
  targetChain: ['acala'],
  minBridgeAmount: '0.1',
};

export const SBY: XcmTokenInformation = {
  symbol: 'ASTR',
  isNativeToken: true,
  astarAssetId: idAstarNativeToken,
  originAssetId: 'SBY',
  icon: require('src/assets/img/astr-token.png'),
  isXcmCompatible: true,
  originChain: 'shibuya',
  targetChain: ['mandala'],
  minBridgeAmount: '0.1',
};
