import { injectable } from 'inversify';
import { AccountInfoModel } from 'src/v2/models';
import { ISystemRepository } from 'src/v2/repositories';

@injectable()
export class SystemRepositoryMock implements ISystemRepository {
  getAccountInfo(address: string): Promise<AccountInfoModel> {
    throw new Error('Method not implemented.');
  }
  startBlockSubscription(): Promise<void> {
    return Promise.resolve();
  }
}
