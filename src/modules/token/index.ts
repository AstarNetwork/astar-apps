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
  bridgedChainId?: number;
  bridgedTokenAddress?: string;
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

export const registeredErc20Tokens: Erc20Token[] = [WASTR];

// Memo: Define the token image source
export const tokenImageMap = {
  ARSW: 'https://assets.coingecko.com/coins/images/26048/small/arsw.png?1655440190',
  LAY: 'https://assets.coingecko.com/coins/images/25795/small/WKBrkX4y_400x400.png?1653920060',
  USDT: 'https://assets.coingecko.com/coins/images/325/large/Tether-logo.png?1598003707',
  WETH: 'https://assets.coingecko.com/coins/images/2518/small/weth.png?1628852295',
};
