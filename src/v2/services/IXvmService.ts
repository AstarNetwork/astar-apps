import { XvmAssets } from 'src/store/assets/state';

export interface XvmGetAssetsParam {
  currentAccount: string;
  isFetchUsd: boolean;
  srcChainId: number;
}

export interface IXvmService extends IXvmTransfer {
  getAssets(param: XvmGetAssetsParam): Promise<XvmAssets>;
}

export interface XvmTransferParam {
  token: any;
  senderAddress: string;
  recipientAddress: string;
  amount: string;
  finalizedCallback?: (hash: string) => Promise<void>;
}

export interface IXvmTransfer {
  transfer({
    token,
    senderAddress,
    recipientAddress,
    amount,
    finalizedCallback,
  }: XvmTransferParam): Promise<void>;
}
