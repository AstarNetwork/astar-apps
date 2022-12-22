import { Erc20Token } from 'src/modules/token';
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
  token: Erc20Token;
  senderAddress: string;
  recipientAddress: string;
  amount: string;
  finalizedCallback: () => void;
}

export interface IXvmTransfer {
  transfer({
    token,
    senderAddress,
    finalizedCallback,
    recipientAddress,
    amount,
  }: XvmTransferParam): Promise<void>;
}
