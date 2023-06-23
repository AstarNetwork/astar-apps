export interface IAssetsService {
  transferNativeAsset(param: ParamAssetTransfer): Promise<void>;
  transferEvmAsset(param: ParamEvmTransfer): Promise<void>;
  evmWithdraw(param: ParamEvmWithdraw): Promise<void>;
}

export interface ParamAssetTransfer {
  assetId: string;
  senderAddress: string;
  receivingAddress: string;
  amount: string;
  successMessage: string;
  finalizedCallback: (hash: string) => void;
}

export interface ParamEvmTransfer {
  senderAddress: string;
  toAddress: string;
  amount: string;
  contractAddress: string;
  decimals: number;
  successMessage: string;
  finalizedCallback: (hash: string) => void;
}

export interface ParamEvmWithdraw {
  amount: string;
  senderAddress: string;
}
