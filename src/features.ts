// Bridges
export const nativeBridgeEnabled = false;
export const layerZeroBridgeEnabled = false;
export const layerSwapBridgeEnabled = false;
export const celerBridgeEnabled = false;
export const omniBridgeEnabled = true;
const stargateBridgeEnabled = true;
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

// XCM - TODO in the next PR
// export const xcmEnabled = true;
