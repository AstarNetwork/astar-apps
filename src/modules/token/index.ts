export { getTokenImage, getErc20Explorer, checkIsWrappedToken } from './utils';

// Memo: ERC20 tokens information that is not supported by cBridge

export interface Erc20Token {
  srcChainId: number;
  address: string;
  decimal: number;
  symbol: string;
  name: string;
  image: string;
  isWrappedToken: boolean;
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
  wrapUrl: 'https://app.arthswap.org/#/swap',
};

export const registeredErc20Tokens = [WASTR];
