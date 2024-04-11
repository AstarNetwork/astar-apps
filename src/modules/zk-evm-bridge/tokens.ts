export const TOKEN_BLACKLIST = [
  // WETH (Ethereum)
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  // WETH (Astar zkEVM)
  '0xE9CC37904875B459Fa5D0FE37680d36F1ED55e38',
  // STONE (Ethereum)
  '0x7122985656e38BDC0302Db86685bb972b145bD3C',
  // STONE (Astar zkEVM)
  '0x80137510979822322193fc997d400d5a6c747bf7',
];

export const addressAstrZkEvm = '0xdf41220C7e322bFEF933D85D01821ad277f90172';
export const addressVastrZkEvm = '0x7746ef546d562b443AE4B4145541a3b1a3D75717';

export const DEFAULT_TOKENS = [
  {
    srcChainId: 1,
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimal: '6',
    symbol: 'USDT',
    name: 'Tether USD',
    image: 'https://assets.coingecko.com/coins/images/325/large/Tether-logo.png?1598003707',
    isWrappedToken: false,
    isXC20: false,
    bridgeUrl: null,
    bridgedTokenAddress: '0x1E4a5963aBFD975d8c9021ce480b42188849D41d',
    bridgedChainId: 3776,
  },
  {
    srcChainId: 3776,
    address: '0x1E4a5963aBFD975d8c9021ce480b42188849D41d',
    decimal: '6',
    symbol: 'USDT',
    name: 'Tether USD',
    image: 'https://assets.coingecko.com/coins/images/325/large/Tether-logo.png?1598003707',
    isWrappedToken: false,
    isXC20: false,
    bridgeUrl: null,
    bridgedTokenAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    bridgedChainId: 1,
  },
  {
    srcChainId: 1,
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    decimal: '6',
    symbol: 'USDC',
    name: 'USD Coin',
    image:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
    isWrappedToken: false,
    isXC20: false,
    bridgeUrl: null,
    bridgedTokenAddress: '0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035',
    bridgedChainId: 3776,
  },
  {
    srcChainId: 3776,
    address: '0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035',
    decimal: '6',
    symbol: 'USDC',
    name: 'USD Coin',
    image:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
    isWrappedToken: false,
    isXC20: false,
    bridgeUrl: null,
    bridgedTokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    bridgedChainId: 1,
  },
  {
    srcChainId: 1,
    address: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
    decimal: '18',
    symbol: 'wstETH',
    name: 'Wrapped liquid staked Ether 2.0',
    image: 'https://assets.coingecko.com/coins/images/18834/standard/wstETH.png?1696518295',
    isWrappedToken: false,
    isXC20: false,
    bridgeUrl: null,
    bridgedTokenAddress: '0x5D8cfF95D7A57c0BF50B30b43c7CC0D52825D4a9',
    bridgedChainId: 3776,
  },
  {
    srcChainId: 3776,
    address: '0x5D8cfF95D7A57c0BF50B30b43c7CC0D52825D4a9',
    decimal: '18',
    symbol: 'wstETH',
    name: 'Wrapped liquid staked Ether 2.0',
    image: 'https://assets.coingecko.com/coins/images/18834/standard/wstETH.png?1696518295',
    isWrappedToken: false,
    isXC20: false,
    bridgeUrl: null,
    bridgedTokenAddress: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
    bridgedChainId: 1,
  },
  {
    srcChainId: 1,
    address: '0xcd5fe23c85820f7b72d0926fc9b05b43e359b7ee',
    decimal: '18',
    symbol: 'weETH',
    name: 'Wrapped eETH',
    image: 'https://assets.coingecko.com/coins/images/33033/standard/weETH.png?1701438396',
    isWrappedToken: false,
    isXC20: false,
    bridgeUrl: null,
    bridgedTokenAddress: '0xcD68DFf4415358c35a28f96Fd5bF7083B22De1D6',
    bridgedChainId: 3776,
  },
  {
    srcChainId: 3776,
    address: '0xcD68DFf4415358c35a28f96Fd5bF7083B22De1D6',
    decimal: '18',
    symbol: 'weETH',
    name: 'Wrapped eETH',
    image: 'https://assets.coingecko.com/coins/images/33033/standard/weETH.png?1701438396',
    isWrappedToken: false,
    isXC20: false,
    bridgeUrl: null,
    bridgedTokenAddress: '0xcd5fe23c85820f7b72d0926fc9b05b43e359b7ee',
    bridgedChainId: 1,
  },
  {
    srcChainId: 1,
    address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    decimal: '8',
    symbol: 'WBTC',
    name: 'Wrapped BTC',
    image:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
    isWrappedToken: false,
    isXC20: false,
    bridgeUrl: null,
    bridgedTokenAddress: '0xEA034fb02eB1808C2cc3adbC15f447B93CbE08e1',
    bridgedChainId: 3776,
  },
  {
    srcChainId: 3776,
    address: '0xEA034fb02eB1808C2cc3adbC15f447B93CbE08e1',
    decimal: '8',
    symbol: 'WBTC',
    name: 'Wrapped BTC',
    image:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
    isWrappedToken: false,
    isXC20: false,
    bridgeUrl: null,
    bridgedTokenAddress: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    bridgedChainId: 1,
  },
  {
    srcChainId: 1,
    address: '0x6b175474e89094c44da98b954eedeac495271d0f',
    decimal: '18',
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    image:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
    isWrappedToken: false,
    isXC20: false,
    bridgeUrl: null,
    bridgedTokenAddress: '0xC5015b9d9161Dca7e18e32f6f25C4aD850731Fd4',
    bridgedChainId: 3776,
  },
  {
    srcChainId: 3776,
    address: '0xC5015b9d9161Dca7e18e32f6f25C4aD850731Fd4',
    decimal: '18',
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    image:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
    isWrappedToken: false,
    isXC20: false,
    bridgeUrl: null,
    bridgedTokenAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
    bridgedChainId: 1,
  },
  {
    srcChainId: 1,
    address: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
    decimal: '18',
    symbol: 'MATIC',
    name: 'Matic Token',
    image: 'https://assets.coingecko.com/coins/images/4713/standard/polygon.png?1698233745',
    isWrappedToken: false,
    isXC20: false,
    bridgeUrl: null,
    bridgedTokenAddress: '0xa2036f0538221a77A3937F1379699f44945018d0',
    bridgedChainId: 3776,
  },
  {
    srcChainId: 3776,
    address: '0xa2036f0538221a77A3937F1379699f44945018d0',
    decimal: '18',
    symbol: 'MATIC',
    name: 'Matic Token',
    image: 'https://assets.coingecko.com/coins/images/4713/standard/polygon.png?1698233745',
    isWrappedToken: false,
    isXC20: false,
    bridgeUrl: null,
    bridgedTokenAddress: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
    bridgedChainId: 1,
  },
  {
    srcChainId: 3776,
    address: '0xdf41220C7e322bFEF933D85D01821ad277f90172',
    decimal: '18',
    symbol: 'ASTR',
    name: 'Astar Token',
    image: 'https://assets.coingecko.com/coins/images/22617/standard/astr.png?1696521933',
    isWrappedToken: false,
    isXC20: false,
    bridgeUrl: null,
    bridgedTokenAddress: '0x90bE3031Ffbf419881D205d81483aeF9640c31C3',
    bridgedChainId: 1,
  },
  {
    srcChainId: 1,
    address: '0x90bE3031Ffbf419881D205d81483aeF9640c31C3',
    decimal: '18',
    symbol: 'ASTR',
    name: 'Astar Token',
    image: 'https://assets.coingecko.com/coins/images/22617/standard/astr.png?1696521933',
    isWrappedToken: false,
    isXC20: false,
    bridgeUrl: null,
    bridgedTokenAddress: '0xdf41220C7e322bFEF933D85D01821ad277f90172',
    bridgedChainId: 3776,
  },
  {
    srcChainId: 11155111,
    address: '0x80e01ecc2f1c73025b177dbacc928580fdc562be',
    decimal: '18',
    symbol: 'CAT',
    name: 'CAT',
    image: '',
    isWrappedToken: false,
    isXC20: false,
    bridgeUrl: null,
    bridgedTokenAddress: '0x3Fe1220e5CB4cED5747245191CF0c4a2786dF4D3',
    bridgedChainId: 6038361,
  },
  {
    srcChainId: 6038361,
    address: '0x3Fe1220e5CB4cED5747245191CF0c4a2786dF4D3',
    decimal: '18',
    symbol: 'CAT',
    name: 'CAT',
    image: '',
    isWrappedToken: false,
    isXC20: false,
    bridgeUrl: null,
    bridgedTokenAddress: '0x80e01ecc2f1c73025b177dbacc928580fdc562be',
    bridgedChainId: 11155111,
  },
  {
    srcChainId: 3776,
    address: '0x7746ef546d562b443AE4B4145541a3b1a3D75717',
    decimal: '18',
    symbol: 'vASTR',
    name: 'Bifrost Voucher ASTR',
    image: 'https://assets.coingecko.com/coins/images/34706/standard/vASTR.png?1705893008',
    isWrappedToken: false,
    isXC20: false,
    bridgeUrl: null,
    bridgedTokenAddress: '0x362e5b2CbE72f1A164F61dfAACCb9B1Ab0Cb0802',
    bridgedChainId: 1,
  },
  {
    srcChainId: 1,
    address: '0x362e5b2CbE72f1A164F61dfAACCb9B1Ab0Cb0802',
    decimal: '18',
    symbol: 'vASTR',
    name: 'Bifrost Voucher ASTR',
    image: 'https://assets.coingecko.com/coins/images/34706/standard/vASTR.png?1705893008',
    isWrappedToken: false,
    isXC20: false,
    bridgeUrl: null,
    bridgedTokenAddress: '0x7746ef546d562b443AE4B4145541a3b1a3D75717',
    bridgedChainId: 3776,
  },
  {
    srcChainId: 3776,
    address: '0x80137510979822322193fc997d400d5a6c747bf7',
    decimal: '18',
    symbol: 'STONE',
    name: 'StakeStone Ether',
    image: 'https://assets.coingecko.com/coins/images/33103/standard/200_200.png?1702602672',
    isWrappedToken: false,
    isXC20: false,
    bridgeUrl: 'https://app.stakestone.io/u/bridge',
    bridgedTokenAddress: '',
    bridgedChainId: 1,
  },
  {
    srcChainId: 3776,
    address: '0x7Cb5d4D178d93D59ea0592abF139459957898a59',
    decimal: '18',
    symbol: 'DOT',
    name: 'DOT Token',
    image: 'https://assets.coingecko.com/coins/images/12171/standard/polkadot.png?1696512008',
    isWrappedToken: false,
    isXC20: false,
    bridgeUrl: 'https://stargate.finance/transfer',
    bridgedTokenAddress: '',
    bridgedChainId: 1,
  },
];
