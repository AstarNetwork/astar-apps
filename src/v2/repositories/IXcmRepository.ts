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
    amount: BN
  ): Promise<ExtrinsicPayload>;

  getTransferToRelayChainCall(
    from: Network,
    recipientAddress: string,
    amount: BN
  ): Promise<ExtrinsicPayload>;
}
