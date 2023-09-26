import { BN } from '@polkadot/util';
import { Asset } from 'src/v2/models';
import { ExtrinsicPayload } from '../integration';
import { XcmChain } from 'src/v2/models/XcmModels';

export interface IXcmRepository {
  getAssets(currentAccount: string): Promise<Asset[]>;

  getTransferToParachainCall(
    from: XcmChain,
    to: XcmChain,
    recipientAddress: string,
    token: Asset,
    amount: BN,
    endpoint: string
  ): Promise<ExtrinsicPayload>;

  getTransferToOriginChainCall(
    from: XcmChain,
    recipientAddress: string,
    amount: BN,
    endpoint: string
  ): Promise<ExtrinsicPayload>;

  getTransferCall(
    from: XcmChain,
    to: XcmChain,
    recipientAddress: string,
    token: Asset,
    amount: BN,
    endpoint: string
  ): Promise<ExtrinsicPayload>;

  getTokenBalance(
    address: string,
    chain: XcmChain,
    token: Asset,
    isNativeToken: boolean,
    endpoint: string
  ): Promise<string>;

  getNativeBalance(address: string, chain: XcmChain, endpoint: string): Promise<BN>;

  getXcmVersion(from: XcmChain): { version: string; isV3: boolean };
}
