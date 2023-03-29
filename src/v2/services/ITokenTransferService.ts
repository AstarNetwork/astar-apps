export interface ITokenTransferService {
  transferNativeAsset(param: AssetTransferParam): Promise<void>;
  transferEvmAsset(param: EvmTransferParam): Promise<void>;
}

export interface AssetTransferParam {
  assetId: string;
  senderAddress: string;
  receivingAddress: string;
  amount: string;
  finalizedCallback: (hash: string) => void;
}

export interface EvmTransferParam {
  senderAddress: string;
  toAddress: string;
  amount: string;
  contractAddress: string;
  decimals: number;
  finalizedCallback: (hash: string) => void;
}
