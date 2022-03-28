import { getIcon } from './../../c-bridge';

export const getTokenImage = ({
  isNativeToken,
  symbol,
  iconUrl,
}: {
  isNativeToken: boolean;
  symbol: string;
  iconUrl?: string;
}): string => {
  if (isNativeToken) {
    return symbol === 'SDN' ? 'icons/sdn-token.png' : 'icons/astar.png';
  } else {
    return getIcon({ icon: String(iconUrl), symbol });
  }
};
