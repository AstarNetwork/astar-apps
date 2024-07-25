// Bridges
export const nativeBridgeEnabled = true;
export const layerZeroBridgeEnabled = true;
export const layerSwapBridgeEnabled = true;
export const celerBridgeEnabled = true;
export const omniBridgeEnabled = true;
export const stargateBridgeEnabled = true;
export const stakeStoneBridgeEnabled = true;
export const arthSwapBridgeEnabled = true;

export const isBridgeEnabled = (bridgeUrl?: string): boolean => {
  switch (true) {
    case bridgeUrl?.includes('https://stargate.finance'):
      return stargateBridgeEnabled;
    case bridgeUrl?.includes('https://app.stakestone.io'):
      return stakeStoneBridgeEnabled;
    case bridgeUrl?.includes('https://app.arthswap.org'):
      return arthSwapBridgeEnabled;
    case bridgeUrl?.includes('https://cbridge.celer.network'):
      return celerBridgeEnabled;
    default:
      return false;
  }
};

// XCM - TODO in the next PR
// export const xcmEnabled = true;
