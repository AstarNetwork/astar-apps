import { networkParam, Path } from 'src/router/routes';

export const getHeaderName = (path: string): string => {
  if (path.includes('dashboard')) {
    return 'Dashboard';
  } else if (path.includes('xvm-transfer')) {
    return 'Transfer XVM Assets';
  } else if (path.includes('transfer')) {
    return 'Transfer Assets';
  } else if (path.includes('assets')) {
    return 'Your Assets';
  } else if (path.includes('stake')) {
    return 'Stake';
  } else if (path.includes('dapp-staking-v3')) {
    return 'dApp Staking v3';
  } else if (path.includes('dapp-staking')) {
    return 'dApp Staking';
  } else if (path.includes('bridge')) {
    return 'Bridge';
  }
  return '';
};

export const buildTransferPageLink = (symbol: string): string => {
  const base = networkParam + Path.Assets + Path.Transfer;
  return `${base}?token=${symbol.toLowerCase()}&mode=local`;
};

export const buildEthereumBridgePageLink = (): string => {
  return networkParam + Path.Bridge + Path.Ethereum;
};

export const buildXvmTransferPageLink = (symbol: string): string => {
  const base = networkParam + Path.Assets + Path.XvmTransfer;
  return `${base}?token=${symbol.toLowerCase()}`;
};

/**
 * A helper function to replace the network params to the selected network
 * EX: `http://localhost:8080/shiden/assets` -> `http://localhost:8080/astar/assets`
 * @param network networkAlias in providerEndpoints
 * @returns URL
 */
export const buildNetworkUrl = (network: string) => {
  const href = window.location.href;
  const hrefArray = href.split('/');
  const networkIndex = 3;

  const url = hrefArray
    .slice(0, hrefArray.length)
    .map((it: string, index: number) => (index === networkIndex ? network : it))
    .join('/');

  // Memo: `window.open(url, '_self')` won't work with `#`
  if (url.includes('#staking')) {
    return url.replace('#staking', '');
  }

  return url;
};
