export interface IAccountUnificationService {
  unifyAccounts(ss58Address: string, h160Address: string): Promise<void>;
}
