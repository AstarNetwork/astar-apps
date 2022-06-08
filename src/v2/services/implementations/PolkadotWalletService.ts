import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult, Signer, ITuple } from '@polkadot/types/types';
import { InjectedExtension } from '@polkadot/extension-inject/types';
import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';
import { EventRecord, DispatchError } from '@polkadot/types/interfaces';
import { inject, injectable } from 'inversify-props';
import { IWalletService } from 'src/v2/services';
import { Account } from 'src/v2/models';
import { IMetadataRepository } from 'src/v2/repositories';
import { BusyMessage, ExtrinsicStatusMessage, IEventAggregator } from 'src/v2/messaging';

@injectable()
export class PolkadotWalletService implements IWalletService {
  private readonly extensions: InjectedExtension[] = [];

  constructor(
    @inject() private metadataRepository: IMetadataRepository,
    @inject() private eventAggregator: IEventAggregator
  ) {}

  public async signAndSend(
    extrinsic: SubmittableExtrinsic<'promise', ISubmittableResult>,
    senderAddress: string
  ): Promise<void> {
    try {
      await this.checkExtension();
      await extrinsic.signAndSend(
        senderAddress,
        {
          signer: await this.getSigner(senderAddress),
          nonce: -1,
        },
        (result) => {
          if (result.isFinalized) {
            if (!this.isExtrinsicFailed(result.events)) {
              this.eventAggregator.publish(new ExtrinsicStatusMessage(true, 'Success'));
            }

            this.eventAggregator.publish(new BusyMessage(false));
          } else {
            this.eventAggregator.publish(new BusyMessage(true));
          }
        }
      );
    } catch (e) {
      const error = e as unknown as Error;
      this.eventAggregator.publish(new ExtrinsicStatusMessage(false, error.message));
    }
  }

  private async getAccounts(): Promise<Account[]> {
    await this.checkExtension();
    const metadata = await this.metadataRepository.getChainMetadata();
    const accounts = await web3Accounts({ ss58Format: metadata.ss58format });
    const result = accounts.map((x) => {
      return new Account(x.address, x.meta.genesisHash, x.meta.name, x.meta.source);
    });

    return result;
  }

  private async getSigner(address: string): Promise<Signer> {
    const sender = (await this.getAccounts()).find((x) => x.address === address);

    if (sender) {
      const extension = this.extensions.find((x) => x.name === sender.source);

      if (extension) {
        return extension.signer;
      } else {
        throw new Error(`Can't find polkadot extension for ${sender.address}, ${sender.source}`);
      }
    } else {
      throw new Error(`Can't find account for ${address}`);
    }
  }

  private async checkExtension(): Promise<void> {
    if (this.extensions.length === 0) {
      const maxRetryCount = 10;
      let retryCount = 0;
      let extensions: InjectedExtension[] = [];
      do {
        extensions = await web3Enable('Astar portal');
        await this.wait(100);
        retryCount++;
      } while (extensions.length === 0 && retryCount <= maxRetryCount);

      if (extensions.length === 0) {
        throw new Error('Polkadot extension not installed.');
      }

      this.extensions.push(...extensions);
    }
  }

  private isExtrinsicFailed(events: EventRecord[]): boolean {
    let result = false;
    let message = '';
    events
      .filter((record): boolean => !!record.event && record.event.section !== 'democracy')
      .map(({ event: { data, method, section } }) => {
        if (section === 'system' && method === 'ExtrinsicFailed') {
          const [dispatchError] = data as unknown as ITuple<[DispatchError]>;
          message = dispatchError.type.toString();

          if (dispatchError.isModule) {
            try {
              const mod = dispatchError.asModule;
              const error = dispatchError.registry.findMetaError(mod);

              message = `${error.section}.${error.name}`;
            } catch (error) {
              // swallow
              console.error(error);
            }
          } else if (dispatchError.isToken) {
            message = `${dispatchError.type}.${dispatchError.asToken.type}`;
          }

          result = true;
        } else if (section === 'utility' && method === 'BatchInterrupted') {
          // TODO there should be a better way to extract error,
          // for some reason cast data as unknown as ITuple<[DispatchError]>; doesn't work
          const anyData = data as any;
          const error = anyData[1].registry.findMetaError(anyData[1].asModule);
          let message = `${error.section}.${error.name}`;
          message = `action: ${section}.${method} ${message}`;
          result = true;
        }
      });

    if (result) {
      this.eventAggregator.publish(new ExtrinsicStatusMessage(false, message));
    }

    return result;
  }

  // TODO move to common lib
  wait(ms: number): Promise<number> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
