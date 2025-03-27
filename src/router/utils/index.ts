import { CcipNetworkParam } from 'src/modules/ccip-bridge';
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

export const buildCcipBridgePageLink = ({
  from,
  to,
}: {
  from: CcipNetworkParam;
  to: CcipNetworkParam;
}): string => {
  const base = networkParam + Path.Bridge + Path.Ccip;
  return base + `?from=${from}&to=${to}`;
};

export const buildLzBridgePageLink = (): string => {
  return networkParam + Path.Bridge + Path.Layerzero;
};

export const buildXvmTransferPageLink = (symbol: string): string => {
  const base = networkParam + Path.Assets + Path.XvmTransfer;
  return `${base}?token=${symbol.toLowerCase()}`;
};

/**
 * A helper function to build the URL and redirect to the selected network's assets page
 * EX: `http://localhost:8080/shiden/bridge` -> `http://localhost:8080/astar/assets`
 * @param network networkAlias in providerEndpoints
 */
export const buildNetworkUrl = (network: string) => {
  const href = window.location.href;
  const hrefArray = href.split('/');
  // Memo: Extract the protocol + host
  const host = hrefArray.slice(0, 3).join('/');
  const url = `${host}/${network}${Path.Assets}`;
  return url;
};
