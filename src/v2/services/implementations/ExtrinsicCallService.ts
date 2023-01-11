import { inject, injectable } from 'inversify';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { Symbols } from 'src/v2/symbols';
import { ISubmittableResult } from '@polkadot/types/types';
import { IExtrinsicCallService } from '../IExtrinsicCallService';
import { IExtrinsicCallRepository } from 'src/v2/repositories/IExtrinsicCallRepository';
import { BusyMessage, ExtrinsicStatusMessage, IEventAggregator } from 'src/v2/messaging';
import { WalletService } from './WalletService';
import { Guard } from 'src/v2/common';
import { EcdsaAccount } from 'src/store/general/state';

@injectable()
export class ExtrinsicCallService extends WalletService implements IExtrinsicCallService {
  constructor(
    @inject(Symbols.ExtrinsicCallRepository)
    private extrinsicCallRepository: IExtrinsicCallRepository,
    @inject(Symbols.EventAggregator) readonly eventAggregator: IEventAggregator
  ) {
    super(eventAggregator);
  }

  public async callCustomExtrinsic(
    method: SubmittableExtrinsic<'promise'>,
    currentEcdsaAccount: EcdsaAccount,
    currentNetworkIdx: number,
    requestSignature: (message: string, account: string) => Promise<string>
  ): Promise<void> {
    try {
      const call = await this.extrinsicCallRepository.getCallFunc(
        method,
        currentEcdsaAccount,
        currentNetworkIdx,
        requestSignature
      );
      this.send(call);
    } catch (e) {
      const error = e as unknown as Error;
      this.eventAggregator.publish(new ExtrinsicStatusMessage(false, error.message));
      this.eventAggregator.publish(new BusyMessage(false));
    }
  }

  public async send(
    extrinsic: SubmittableExtrinsic<'promise', ISubmittableResult>,
    successMessage?: string
  ): Promise<string | null> {
    Guard.ThrowIfUndefined('extrinsic', extrinsic);

    let result: string | null = null;
    try {
      return new Promise<string>(async (resolve) => {
        await extrinsic.send((result: ISubmittableResult) => {
          if (result.isFinalized) {
            if (!this.isExtrinsicFailed(result.events)) {
              this.eventAggregator.publish(
                new ExtrinsicStatusMessage(
                  true,
                  successMessage ?? 'Transaction successfully executed',
                  `${extrinsic.method.section}.${extrinsic.method.method}`,
                  result.txHash.toHex()
                )
              );
            }

            this.eventAggregator.publish(new BusyMessage(false));
            resolve(extrinsic.hash.toHex());
          } else {
            !result.isCompleted && this.eventAggregator.publish(new BusyMessage(true));
          }
        });
      });
    } catch (e) {
      const error = e as unknown as Error;
      this.eventAggregator.publish(new ExtrinsicStatusMessage(false, error.message));
      this.eventAggregator.publish(new BusyMessage(false));
    }

    return result;
  }
}
