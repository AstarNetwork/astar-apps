import { injectable } from 'inversify';
import { Erc20Token } from 'src/modules/token';
import { ExtrinsicPayload } from 'src/v2/integration';
import { IXvmRepository } from 'src/v2/repositories';
import { XvmGetAssetsParam, XvmTransferParam } from 'src/v2/services';

@injectable()
export class XvmRepositoryMock implements IXvmRepository {
  public async getAssets(param: XvmGetAssetsParam): Promise<Erc20Token[]> {
    const result: Erc20Token[] = [];
    const token: Erc20Token = {
      address: '0xd9aF35a156FD891de9DcB45f07858eA51ea3A3aC',
      decimal: 18,
      name: 'Hachi',
      srcChainId: 81,
      symbol: 'HACHI',
      userBalance: '100',
      userBalanceUsd: '0',
    };

    result.push(token);

    return result;
  }

  public getTransferCallData({
    token,
    recipientAddress,
    senderAddress,
    amount,
    finalizedCallback,
  }: XvmTransferParam): Promise<ExtrinsicPayload> {
    return Promise.resolve({} as ExtrinsicPayload);
  }
}
