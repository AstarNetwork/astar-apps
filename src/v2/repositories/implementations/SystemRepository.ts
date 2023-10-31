import { inject, injectable } from 'inversify';
import '@polkadot/api-augment';
import { Guard } from 'src/v2/common';
import { IApi } from 'src/v2/integration';
import { AccountDataModel, AccountInfoModel } from 'src/v2/models';
import { ISystemRepository } from 'src/v2/repositories';
import { Symbols } from 'src/v2/symbols';
import { Struct, u32 } from '@polkadot/types';
import { EventAggregator, NewBlockMessage } from 'src/v2/messaging';
import { BlockHash } from '@polkadot/types/interfaces';

export interface FrameSystemAccountInfo extends Struct {
  readonly nonce: u32;
  readonly consumers: u32;
  readonly providers: u32;
  readonly sufficients: u32;
  readonly data: any;
}

@injectable()
export class SystemRepository implements ISystemRepository {
  private static isBlockSubscribed = false;

  constructor(
    @inject(Symbols.DefaultApi) private api: IApi,
    @inject(Symbols.EventAggregator) private eventAggregator: EventAggregator
  ) {}

  public async getAccountInfo(address: string): Promise<AccountInfoModel> {
    Guard.ThrowIfUndefined('address', address);

    const api = await this.api.getApi();
    const accountInfo = await api.query.system.account<FrameSystemAccountInfo>(address);
    const frozen = accountInfo.data.frozen.toBn();
    const flags = accountInfo.data.flags.toBn();

    return new AccountInfoModel(
      accountInfo.nonce.toBn(),
      new AccountDataModel(
        accountInfo.data.free.toBn(),
        accountInfo.data.reserved.toBn(),
        frozen,
        flags
      )
    );
  }

  public async startBlockSubscription(): Promise<void> {
    // Avoid multiple subscriptions.
    if (!SystemRepository.isBlockSubscribed) {
      const api = await this.api.getApi();
      await api.query.system.number((blockNumber: u32) => {
        this.eventAggregator.publish(new NewBlockMessage(blockNumber.toNumber()));
      });
      SystemRepository.isBlockSubscribed = true;
    }
  }

  public async getChainId(): Promise<number> {
    const api = await this.api.getApi();
    const id = Number((await api.query.evmChainId.chainId()).toString().replace(',', ''));

    return id;
  }

  /**
   * Gets block hash by block number.
   * @param blockNumber Block number
   */
  public async getBlockHash(blockNumber: number): Promise<BlockHash> {
    const api = await this.api.getApi();
    const blockHash = await api.rpc.chain.getBlockHash<BlockHash>(blockNumber);

    return blockHash;
  }
}
