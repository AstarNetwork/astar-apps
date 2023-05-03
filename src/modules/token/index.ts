import { providerEndpoints, endpointKey } from 'src/config/chainEndpoints';

export {
  getTokenImage,
  getErc20Explorer,
  storeImportedERC20Token,
  getStoredERC20Tokens,
  getRegisteredERC20Token,
  castCbridgeToErc20,
  getRegisteredErc20Tokens,
  getStoredXvmTokens,
  storeImportedXvmToken,
  deleteImportedXvmToken,
  deleteImportedErc20Token,
} from 'src/modules/token/utils';

// Memo: ERC20 tokens information that is not supported by cBridge

export interface Erc20Token {
  srcChainId: number;
  address: string;
  decimal: number;
  symbol: string;
  name: string;
  image?: string;
  isWrappedToken?: boolean;
  isXC20?: boolean;
  wrapUrl?: string | null;
  bridgeUrl?: string | null;
  userBalance?: string;
  userBalanceUsd?: string;
  isCbridgeToken?: boolean;
}

export const WASTR: Erc20Token = {
  srcChainId: Number(providerEndpoints[endpointKey.ASTAR].evmChainId),
  address: '0xAeaaf0e2c81Af264101B9129C00F4440cCF0F720',
  decimal: 18,
  symbol: 'WASTR',
  name: 'Wrapped ASTR',
  image: 'https://app.arthswap.org/images/coins/0xAeaaf0e2c81Af264101B9129C00F4440cCF0F720.png',
  isWrappedToken: true,
  isXC20: false,
  wrapUrl: 'https://app.arthswap.org/#/swap',
};

export const ATOM: Erc20Token = {
  srcChainId: Number(providerEndpoints[endpointKey.ASTAR].evmChainId),
  address: '0xfFfFffff000000000000000000000000000186a2',
  decimal: 6,
  symbol: 'ATOM',
  name: 'Cosmos Hub',
  image: 'https://i.postimg.cc/zf4hRjfm/ATOM.png',
  isWrappedToken: false,
  isXC20: false,
  bridgeUrl: 'https://cbridge.celer.network/999999997/592/ASTR',
};

export const INJ: Erc20Token = {
  srcChainId: Number(providerEndpoints[endpointKey.ASTAR].evmChainId),
  address: '0xFfFfFfFF000000000000000000000000000186a1',
  decimal: 18,
  symbol: 'INJ',
  name: 'Injective',
  image: 'https://i.postimg.cc/vZk23WdJ/INJtoken.png',
  isWrappedToken: false,
  isXC20: false,
  bridgeUrl: 'https://cbridge.celer.network/999999997/592/INJ',
};

export const registeredErc20Tokens: Erc20Token[] = [WASTR, ATOM, INJ];

// Memo: Define the token image source
export const tokenImageMap = {
  ARSW: 'https://assets.coingecko.com/coins/images/26048/small/arsw.png?1655440190',
  LAY: 'https://assets.coingecko.com/coins/images/25795/small/WKBrkX4y_400x400.png?1653920060',
};
