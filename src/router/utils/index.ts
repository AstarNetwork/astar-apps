import { networkParam, Path } from 'src/router/routes';

export const getHeaderName = (path: string): string => {
  if (path.includes('dashboard')) {
    return 'Dashboard';
  } else if (path.includes('transfer')) {
    return 'Transfer Assets';
  } else if (path.includes('assets')) {
    return 'Assets';
  } else if (path.includes('dapp-staking')) {
    return 'dApp Staking';
  }
  return '';
};

export const buildTransferPageLink = (symbol: string): string => {
  const base = networkParam + Path.Assets + Path.Transfer;
  return `${base}?token=${symbol.toLowerCase()}&mode=local`;
};

/**
 * A helper function to replace the network params to the selected network
 * EX: `http://localhost:8080/#/shiden/assets` -> `http://localhost:8080/#/astar/assets`
 * @param network networkAlias in providerEndpoints
 * @returns URL
 */
export const buildNetworkUrl = (network: string) => {
  const href = window.location.href;
  const hrefArray = href.split('/');
  const networkIndex = hrefArray.findIndex((it) => it === '#') + 1;
  // E.g.: assets, dashboard, dApp-staking
  const pageIndex = networkIndex + 1;
  return hrefArray
    .slice(0, pageIndex + 1)
    .map((it: string, index: number) => (index === networkIndex ? network : it))
    .join('/');
};
