import { endpointKey } from 'src/config/chainEndpoints';
import { XcmNetworkIdx, XcmTokenInformation } from '..';
import { xcmToken } from '../tokens';

export const getXcmToken = ({
  symbol,
  currentNetworkIdx,
}: {
  symbol: string;
  currentNetworkIdx: endpointKey;
}): XcmTokenInformation | undefined => {
  const networkIdx = currentNetworkIdx as XcmNetworkIdx;
  const t = xcmToken[networkIdx].find((it: XcmTokenInformation) => it.symbol === symbol);
  return t;
};
