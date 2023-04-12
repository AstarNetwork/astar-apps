import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { InjectedExtension } from '@polkadot/extension-inject/types';
import { Signer } from '@polkadot/types/types';
import { ethers } from 'ethers';
import { inject, injectable } from 'inversify';
import { endpointKey, providerEndpoints } from 'src/config/chainEndpoints';
import { isMobileDevice } from 'src/hooks/helper/wallet';
import { AlertMsg } from 'src/modules/toast/index';
import { Guard, wait } from 'src/v2/common';
import { BusyMessage, ExtrinsicStatusMessage, IEventAggregator } from 'src/v2/messaging';
import { Account } from 'src/v2/models';
import { IMetadataRepository } from 'src/v2/repositories';
import { IGasPriceProvider, IWalletService, ParamSignAndSend } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { WalletService } from './WalletService';

@injectable()
export class PolkadotWalletService extends WalletService implements IWalletService {
  private readonly extensions: InjectedExtension[] = [];

  constructor(
    @inject(Symbols.MetadataRepository) private readonly metadataRepository: IMetadataRepository,
    @inject(Symbols.EventAggregator) readonly eventAggregator: IEventAggregator,
    @inject(Symbols.GasPriceProvider) private readonly gasPriceProvider: IGasPriceProvider
  ) {
    super(eventAggregator);
  }

  /**
   * Signs given transaction.
   * @param extrinsic Transaction to sign.
   * @param senderAddress Sender address.
   * @param successMessage Mesage to be displayed to user in case of successful tansaction.
   * If not defined, default message will be shown.
   * @param tip Transaction tip, If not provided it will be fetched from gas price provider,
   */
  public async signAndSend({
    extrinsic,
    senderAddress,
    successMessage,
    transactionTip,
    finalizedCallback,
    subscan,
  }: ParamSignAndSend): Promise<string | null> {
    Guard.ThrowIfUndefined('extrinsic', extrinsic);
    Guard.ThrowIfUndefined('senderAddress', senderAddress);

    let result: string | null = null;
    try {
      return new Promise<string>(async (resolve) => {
        !isMobileDevice && this.detectExtensionsAction(true);
        await this.checkExtension();
        let tip = transactionTip?.toString();
        if (!tip) {
          tip = this.gasPriceProvider.getTip().price;
          tip = tip ? ethers.utils.parseEther(tip).toString() : '1';
        }

        console.info('transaction tip', tip);

        const unsub = await extrinsic.signAndSend(
          senderAddress,
          {
            signer: await this.getSigner(senderAddress),
            nonce: -1,
            tip,
          },
          (result) => {
            try {
              !isMobileDevice && this.detectExtensionsAction(false);
              if (result.isCompleted) {
                if (!this.isExtrinsicFailed(result.events)) {
                  if (result.isError) {
                    this.eventAggregator.publish(new ExtrinsicStatusMessage(false, AlertMsg.ERROR));
                  } else {
                    const subscanUrl = this.getSubscan({
                      subscanBase: subscan,
                      hash: result.txHash.toHex(),
                    });
                    this.eventAggregator.publish(
                      new ExtrinsicStatusMessage(
                        true,
                        successMessage ?? AlertMsg.SUCCESS,
                        `${extrinsic.method.section}.${extrinsic.method.method}`,
                        subscanUrl
                      )
                    );
                  }
                }

                this.eventAggregator.publish(new BusyMessage(false));
                if (finalizedCallback) {
                  finalizedCallback(result);
                }
                resolve(extrinsic.hash.toHex());
                unsub();
              } else {
                if (isMobileDevice && !result.isCompleted) {
                  this.eventAggregator.publish(new BusyMessage(true));
                }
              }
            } catch (error) {
              this.eventAggregator.publish(new BusyMessage(false));
              unsub();
            }
          }
        );
      });
    } catch (e) {
      const error = e as unknown as Error;
      this.eventAggregator.publish(new ExtrinsicStatusMessage(false, error.message));
      this.eventAggregator.publish(new BusyMessage(false));
    }

    return result;
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
        await wait(100);
        retryCount++;
      } while (extensions.length === 0 && retryCount <= maxRetryCount);

      if (extensions.length === 0) {
        throw new Error('Polkadot extension not installed.');
      }

      this.extensions.push(...extensions);
    }
  }

  // Memo: detects status in the wallet extension
  // Fixme: doesn't work on MathWallet Mobile
  // Ref: https://github.com/polkadot-js/extension/issues/674
  // Ref: https://github.com/polkadot-js/extension/blob/297b2af14c68574b24bb8fdeda2208c473eccf43/packages/extension/src/page.ts#L10-L22
  private detectExtensionsAction(isMonitorExtension: boolean): void {
    const handleDetectSign = (listener: any): void => {
      const { source, data } = listener;
      if (source !== window || !data.origin) {
        return;
      }
      if (data.id) {
        if (data.response && data.response.hasOwnProperty('signature')) {
          this.eventAggregator.publish(new BusyMessage(true));
          return;
        }
        // Memo: detect if the transaction was canceled by users
        if (data.error === 'Cancelled') {
          this.eventAggregator.publish(new BusyMessage(false));
          throw Error(data.error);
        }
      }
    };

    isMonitorExtension
      ? window.addEventListener('message', handleDetectSign)
      : window.removeEventListener('message', handleDetectSign);
  }

  private getSubscan({ subscanBase, hash }: { subscanBase?: string; hash: string }): string {
    if (subscanBase) {
      return `${subscanBase}/extrinsic/${hash}`;
    } else {
      const pathname = window.location.pathname;
      let network = pathname.split('/')[1];
      if (network === providerEndpoints[endpointKey.SHIBUYA].networkAlias) {
        network = 'shibuya';
      }
      return `https://${network}.subscan.io/extrinsic/${hash}`;
    }
  }
}
