export interface IAccountUnificationService {
  unifyAccounts(
    nativeAddress: string,
    evmAddress: string,
    accountName: string,
    avatarNftAddress?: string,
    avatarNftId?: string
  ): Promise<boolean>;
  getMappedNativeAddress(evmAddress: string): Promise<string>;
  getMappedEvmAddress(nativeAddress: string): Promise<string>;
  getConvertedNativeAddress(evmAddress: string): Promise<string>;
  getConvertedEvmAddress(nativeAddress: string): Promise<string>;
  checkIsUnifiedAccount(address: string): Promise<boolean>;
}
