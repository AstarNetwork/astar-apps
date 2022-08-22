export {
  getTokenImage,
  getErc20Explorer,
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

export const KAR = {
  srcChainId: 336,
  address: '0xffffffff00000000000000010000000000000002',
  decimal: 12,
  symbol: 'KAR',
  name: 'Karura',
  image: 'https://assets.coingecko.com/coins/images/17172/small/karura.jpeg?1626782066',
  isWrappedToken: false,
  isXC20: true,
  wrapUrl: null,
};

export const KUSD = {
  srcChainId: 336,
  address: '0xffffffff00000000000000010000000000000000',
  decimal: 12,
  symbol: 'aUSD',
  name: 'Acala Dollar',
  image: 'https://assets.coingecko.com/coins/images/25812/small/ezgif-1-f4612f5260.png?1653987299',
  isWrappedToken: false,
  isXC20: true,
  wrapUrl: null,
};

export const LKSM = {
  srcChainId: 336,
  address: '0xffffffff00000000000000010000000000000003',
  decimal: 12,
  symbol: 'LKSM',
  name: 'Liquid KSM',
  image: 'https://resources.acala.network/tokens/LKSM.png',
  isWrappedToken: false,
  isXC20: true,
  wrapUrl: null,
};

export const ACA = {
  srcChainId: 592,
  address: '0xffffffff00000000000000010000000000000000',
  decimal: 12,
  symbol: 'ACA',
  name: 'Acala',
  image: 'https://assets.coingecko.com/coins/images/20634/small/upOKBONH_400x400.jpg?1647420536',
  isWrappedToken: false,
  isXC20: true,
  wrapUrl: null,
};

export const LDOT = {
  srcChainId: 592,
  address: '0xffffffff00000000000000010000000000000002',
  decimal: 10,
  symbol: 'LDOT',
  name: 'Liquid DOT',
  image:
    'https://assets.coingecko.com/coins/images/25847/small/iShot2022-06-02_13.14.07-removebg-preview.png?1654146888',
  isWrappedToken: false,
  isXC20: true,
  wrapUrl: null,
};

export const AUSD = {
  srcChainId: 592,
  address: '0xffffffff00000000000000010000000000000001',
  decimal: 12,
  symbol: 'AUSD',
  name: 'Acala Dollar',
  image: 'https://assets.coingecko.com/coins/images/25812/small/ezgif-1-f4612f5260.png?1653987299',
  isWrappedToken: false,
  isXC20: true,
  wrapUrl: null,
};

export const MOVR = {
  srcChainId: 336,
  address: '0xffffffff00000000000000010000000000000004',
  decimal: 18,
  symbol: 'MOVR',
  name: 'Moonriver',
  image: 'https://assets.coingecko.com/coins/images/17984/small/9285.png?1630028620',
  isWrappedToken: false,
  isXC20: true,
  wrapUrl: null,
};

export const registeredErc20Tokens = [WASTR, DOT, KSM, KUSD, KAR, LKSM, ACA, LDOT, AUSD, MOVR];

// Memo: Define the token image source
export const tokenImageMap = {
  ARSW: 'https://assets.coingecko.com/coins/images/26048/small/arsw.png?1655440190',
  LAY: 'https://assets.coingecko.com/coins/images/25795/small/WKBrkX4y_400x400.png?1653920060',
};

export const wrappedTokenMap = {
  WASTR: 'ASTR',
};
