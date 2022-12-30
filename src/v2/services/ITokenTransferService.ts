export interface ITokenTransferService {
  transferNativeToken(param: NativeTokenTransferParam): Promise<void>;
}

export interface NativeTokenTransferParam {
  senderAddress: string;
  receivingAddress: string;
  amount: string;
  finalizedCallback?: () => void;
}
