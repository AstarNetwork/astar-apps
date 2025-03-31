import { CcipNetworkName } from './modules/ccip-bridge';

// Bridges
export const nativeBridgeEnabled = false;
export const layerZeroBridgeEnabled = false;
export const layerSwapBridgeEnabled = false;
export const celerBridgeEnabled = true;
export const omniBridgeEnabled = true;
export const ccipAstarBridgeEnabled = true;
export const ccipShibuyaBridgeEnabled = true;
export const ccipMinatoBridgeEnabled = true;
export const ccipSoneiumBridgeEnabled = true;
export const ccipSepoliaBridgeEnabled = true;
export const ccipEthereumBridgeEnabled = true;
export const stargateBridgeEnabled = true;
const stakeStoneBridgeEnabled = true;
const arthSwapBridgeEnabled = true;

export const isBridgeEnabled = (bridgeUrl?: string): boolean => {
  switch (true) {
    case bridgeUrl?.includes('stargate'):
      return stargateBridgeEnabled;
    case bridgeUrl?.includes('stakestone'):
      return stakeStoneBridgeEnabled;
    case bridgeUrl?.includes('arthswap'):
      return arthSwapBridgeEnabled;
    case bridgeUrl?.includes('cbridge'):
      return celerBridgeEnabled;
    default:
      return false;
  }
};

export const checkIsCcipBridgeEnabled = ({
  from,
  to,
}: {
  from: CcipNetworkName;
  to: CcipNetworkName;
}): boolean => {
  const bridgeEnabledMap: { [key in CcipNetworkName]?: { [key in CcipNetworkName]?: boolean } } = {
    [CcipNetworkName.AstarEvm]: {
      [CcipNetworkName.Ethereum]: ccipEthereumBridgeEnabled && ccipAstarBridgeEnabled,
      [CcipNetworkName.Soneium]: ccipSoneiumBridgeEnabled && ccipAstarBridgeEnabled,
    },
    [CcipNetworkName.Soneium]: {
      [CcipNetworkName.AstarEvm]: ccipAstarBridgeEnabled && ccipSoneiumBridgeEnabled,
      [CcipNetworkName.Ethereum]: ccipEthereumBridgeEnabled && ccipSoneiumBridgeEnabled,
    },
    [CcipNetworkName.Ethereum]: {
      [CcipNetworkName.AstarEvm]: ccipAstarBridgeEnabled && ccipEthereumBridgeEnabled,
      [CcipNetworkName.Soneium]: ccipSoneiumBridgeEnabled && ccipEthereumBridgeEnabled,
    },
    [CcipNetworkName.ShibuyaEvm]: {
      [CcipNetworkName.Sepolia]: ccipSepoliaBridgeEnabled && ccipShibuyaBridgeEnabled,
      [CcipNetworkName.SoneiumMinato]: ccipMinatoBridgeEnabled && ccipShibuyaBridgeEnabled,
    },
    [CcipNetworkName.SoneiumMinato]: {
      [CcipNetworkName.Sepolia]: ccipSepoliaBridgeEnabled && ccipMinatoBridgeEnabled,
      [CcipNetworkName.ShibuyaEvm]: ccipShibuyaBridgeEnabled && ccipMinatoBridgeEnabled,
    },
    [CcipNetworkName.Sepolia]: {
      [CcipNetworkName.SoneiumMinato]: ccipMinatoBridgeEnabled && ccipSepoliaBridgeEnabled,
      [CcipNetworkName.ShibuyaEvm]: ccipShibuyaBridgeEnabled && ccipSepoliaBridgeEnabled,
    },
  };

  return bridgeEnabledMap[from]?.[to] ?? false;
};

// XCM - TODO in the next PR
// export const xcmEnabled = true;
