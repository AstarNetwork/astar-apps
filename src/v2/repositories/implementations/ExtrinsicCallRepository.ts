import { injectable, inject } from 'inversify';
import { Symbols } from 'src/v2/symbols';
import { AccountInfo } from '@polkadot/types/interfaces';
import { IApi } from 'src/v2/integration';
import { IExtrinsicCallRepository } from '../IExtrinsicCallRepository';
import { ISubmittableResult } from '@polkadot/types/types';
import { EventAggregator } from 'src/v2/messaging';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import { u8aToHex } from '@polkadot/util';
import { getPayload } from 'src/hooks/extrinsic/payload';
import { providerEndpoints } from 'src/config/chainEndpoints';
import { EcdsaAccount } from 'src/store/general/state';

@injectable()
export class ExtrinsicCallRepository implements IExtrinsicCallRepository {
  constructor(
    @inject(Symbols.DefaultApi) private api: IApi,
    @inject(Symbols.EventAggregator) private eventAggregator: EventAggregator
  ) {}

  public async getCallFunc(
    method: SubmittableExtrinsic<'promise', ISubmittableResult>,
    currentEcdsaAccount: EcdsaAccount,
    currentNetworkIdx: number,
    requestSignature: (message: string, account: string) => Promise<string>
  ): Promise<SubmittableExtrinsic<'promise', ISubmittableResult>> {
    const api = await this.api.getApi();
    const account = <AccountInfo>await api?.query.system.account(currentEcdsaAccount.ss58);
    const callPayload = u8aToHex(
      getPayload(method, account.nonce, providerEndpoints[currentNetworkIdx].prefix || 0)
    );

    if (!callPayload) {
      throw Error('toast.unableCalculateMsgPayload');
      // store.dispatch('general/showAlertMsg', {
      //   msg: t('toast.unableCalculateMsgPayload'),
      //   alertType: 'error',
      // });
    }
    // Sign transaction with eth private key
    const signature = await requestSignature(callPayload, currentEcdsaAccount.ethereum);
    const call = api?.tx.ethCall.call(method, currentEcdsaAccount.ss58, signature, account.nonce);
    return call;
  }
}
