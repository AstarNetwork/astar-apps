import BN from 'bn.js';
import { Asset } from 'src/v2/models';
import { ExtrinsicPayload } from '../integration';
import { XcmChain } from 'src/modules/xcm';

export interface IXcmRepository {
  getAssets(currentAccount: string): Promise<Asset[]>;

  getTransferToParachainCall(
    from: XcmChain,
    to: XcmChain,
    recipientAddress: string,
    token: Asset,
    amount: BN
  ): Promise<ExtrinsicPayload>;

  getTransferToOriginChainCall(
    from: XcmChain,
    recipientAddress: string,
    amount: BN
  ): Promise<ExtrinsicPayload>;

  getTransferCall(
    from: XcmChain,
    to: XcmChain,
    recipientAddress: string,
    token: Asset,
    amount: BN
  ): Promise<ExtrinsicPayload>;
}
