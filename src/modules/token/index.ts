import { EvmChain } from 'src/c-bridge';
import { endpointKey, providerEndpoints } from 'src/config/chainEndpoints';
import { xcmToken } from 'src/modules/xcm';
import { Asset } from 'src/v2/models';

export {
  getTokenImage,
  getErc20Explorer,
  storeImportedERC20Token,
  getStoredERC20Tokens,
  getRegisteredERC20Token,
  castCbridgeToErc20,
} from 'src/modules/token/utils';

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
  isCbridgeToken?: boolean;
}

export const WASTR: Erc20Token = {
  srcChainId: EvmChain.Astar,
  address: '0xAeaaf0e2c81Af264101B9129C00F4440cCF0F720',
  decimal: 18,
  symbol: 'WASTR',
  name: 'Wrapped ASTR',
  image: 'https://app.arthswap.org/images/coins/0xAeaaf0e2c81Af264101B9129C00F4440cCF0F720.png',
  isWrappedToken: true,
  isXC20: false,
  wrapUrl: 'https://app.arthswap.org/#/swap',
};

const registeredErc20Tokens: Erc20Token[] = [WASTR];

export const getRegisteredErc20Tokens = ({
  network,
  assets,
}: {
  network: endpointKey;
  assets: Asset[];
}): Erc20Token[] => {
  const xcmTokens = xcmToken[network];
  const xc20Tokens = xcmTokens.map((it) => {
    try {
      const asset = assets.find((that) => that.id === it.assetId) as Asset;
      return {
        srcChainId: Number(providerEndpoints[network].evmChainId),
        address: asset.mappedERC20Addr,
        decimal: asset.metadata.decimals,
        symbol: asset.metadata.symbol,
        name: asset.metadata.name,
        image: it.logo,
        isWrappedToken: false,
        isXC20: true,
        wrapUrl: null,
      };
    } catch (error) {
      return undefined;
    }
  });

  return (xc20Tokens.filter((it) => it !== undefined) as Erc20Token[]).concat(
    registeredErc20Tokens
  );
};

// Memo: Define the token image source
export const tokenImageMap = {
  ARSW: 'https://assets.coingecko.com/coins/images/26048/small/arsw.png?1655440190',
  LAY: 'https://assets.coingecko.com/coins/images/25795/small/WKBrkX4y_400x400.png?1653920060',
};

export const wrappedTokenMap = {
  WASTR: 'ASTR',
};
