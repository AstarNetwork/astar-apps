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

// XCM - TODO in the next PR
// export const xcmEnabled = true;
