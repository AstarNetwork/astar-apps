import { BN } from '@polkadot/util';
import { XcmChain } from 'src/v2/models';
import { XcmAssets } from 'src/store/assets/state';
import { Asset } from 'src/v2/models';

export interface IXcmService extends IXcmTransfer {
  getAssets(currentAccount: string, isFetchUsd: boolean): Promise<XcmAssets>;

  getTokenBalance(
    address: string,
    chain: XcmChain,
    token: Asset,
    isNativeToken: boolean,
    endpoint: string
  ): Promise<string>;

  getNativeBalance(address: string, chain: XcmChain, endpoint: string): Promise<BN>;
}

export interface TransferParam {
  from: XcmChain;
  to: XcmChain;
  token: Asset;
  senderAddress: string;
  recipientAddress: string;
  amount: number;
  successMessage: string;
  finalizedCallback?: (hash: string) => Promise<void>;
  endpoint: string;
}

export interface IXcmTransfer {
  transfer({
    from,
    to,
    token,
    senderAddress,
    recipientAddress,
    amount,
    finalizedCallback,
  }: TransferParam): Promise<void>;
}
