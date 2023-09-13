export interface IAccountUnificationService {
  unifyAccounts(nativeAddress: string, evmAddress: string): Promise<void>;
  getMappedNativeAddress(evmAddress: string): Promise<string>;
  getMappedEvmAddress(nativeAddress: string): Promise<string>;
}
