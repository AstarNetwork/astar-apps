export {
  getTokenImage,
  getErc20Explorer,
  checkIsWrappedToken,
  storeImportedERC20Token,
  getStoredERC20Tokens,
  getRegisteredERC20Token,
} from './utils';

// Memo: ERC20 tokens information that is not supported by cBridge

export interface Erc20Token {
  srcChainId: number;
  address: string;
  decimal: number;
  symbol: string;
  name: string;
  image: string;
  isWrappedToken: boolean;
  isXC20: boolean;
  wrapUrl: string | null;
  userBalance?: string;
  userBalanceUsd?: string;
}

export const WASTR = {
  srcChainId: 592,
  address: '0xAeaaf0e2c81Af264101B9129C00F4440cCF0F720',
  decimal: 18,
  symbol: 'WASTR',
  name: 'Wrapped ASTR',
  image: 'https://app.arthswap.org/images/coins/0xAeaaf0e2c81Af264101B9129C00F4440cCF0F720.png',
  isWrappedToken: true,
  isXC20: false,
  wrapUrl: 'https://app.arthswap.org/#/swap',
};

export const DOT = {
  srcChainId: 592,
  address: '0xffffffffffffffffffffffffffffffffffffffff',
  decimal: 10,
  symbol: 'DOT',
  name: 'Polkadot',
  image: require('/src/assets/img/ic_dot.png'),
  isWrappedToken: false,
  isXC20: true,
  wrapUrl: null,
};

export const KSM = {
  srcChainId: 336,
  address: '0xffffffffffffffffffffffffffffffffffffffff',
  decimal: 12,
  symbol: 'KSM',
  name: 'Kusama',
  image: require('/src/assets/img/ic_kusama.png'),
  isWrappedToken: false,
  isXC20: true,
  wrapUrl: null,
};

export const registeredErc20Tokens = [WASTR, DOT, KSM];
