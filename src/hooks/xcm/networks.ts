// XCM Networks
export interface XcmNetworkSettings {
  name: string;
  rpcUrl: string;
}

// Put connected networkd here
// Maybe to combine with CHAINS from useXcmBridge
export const networks: XcmNetworkSettings[] = [
  {
    name: 'Polkadot',
    rpcUrl: 'wss://polkadot.api.onfinality.io/public-ws',
  },
  {
    name: 'Astar',
    rpcUrl: 'wss://rpc.astar.network',
  },
];
