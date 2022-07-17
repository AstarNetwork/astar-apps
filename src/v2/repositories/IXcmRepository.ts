import BN from 'bn.js';
import { Asset } from 'src/v2/models';
import { Network } from '../config/types';
import { ExtrinsicPayload } from '../integration';

export interface IXcmRepository {
  getAssets(currentAccount: string): Promise<Asset[]>;

  getTransferToParachainCall(
    from: Network,
    to: Network,
    recipientAddress: string,
    token: Asset,
    amount: BN
  ): Promise<ExtrinsicPayload>;

  getTransferToOriginChainCall(
    from: Network,
    recipientAddress: string,
    amount: BN
  ): Promise<ExtrinsicPayload>;

  getTransferCall(
    from: Network,
    to: Network,
    recipientAddress: string,
    token: Asset,
    amount: BN
  ): Promise<ExtrinsicPayload>;
}
