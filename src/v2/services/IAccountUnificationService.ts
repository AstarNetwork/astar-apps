export interface IAccountUnificationService {
  unifyAccounts(
    nativeAddress: string,
    evmAddress: string,
    accountName: string,
    avatarNftAddress?: string,
    avatarNftId?: string
  ): Promise<void>;
  getMappedNativeAddress(evmAddress: string): Promise<string>;
  getMappedEvmAddress(nativeAddress: string): Promise<string>;
}
