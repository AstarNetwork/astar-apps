import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult, Signer } from '@polkadot/types/types';
import { InjectedExtension } from '@polkadot/extension-inject/types';
import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';
import { inject, injectable } from 'inversify';
import { ethers } from 'ethers';
import { IWalletService, IGasPriceProvider } from 'src/v2/services';
import { Account } from 'src/v2/models';
import { IMetadataRepository } from 'src/v2/repositories';
import { BusyMessage, ExtrinsicStatusMessage, IEventAggregator } from 'src/v2/messaging';
import { WalletService } from './WalletService';
import { Guard, wait } from 'src/v2/common';
import { Symbols } from 'src/v2/symbols';
import { SubstrateAccount } from 'src/store/general/state';
import { addTxHistories, HistoryTxType } from 'src/modules/account';
import { getInjector } from 'src/hooks/helper/wallet';
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
  public async signAndSend(
    extrinsic: SubmittableExtrinsic<'promise', ISubmittableResult>,
    senderAddress: string,
    successMessage?: string,
    transactionTip?: number
  ): Promise<string | null> {
    Guard.ThrowIfUndefined('extrinsic', extrinsic);
    Guard.ThrowIfUndefined('senderAddress', senderAddress);

    let result: string | null = null;
    try {
      return new Promise<string>(async (resolve) => {
        await this.checkExtension();
        let tip = transactionTip?.toString();
        if (!tip) {
          tip = this.gasPriceProvider.getTip().price;
          tip = tip ? ethers.utils.parseEther(tip).toString() : '1';
        }

        console.info('transaction tip', tip);

        await extrinsic.signAndSend(
          senderAddress,
          {
            signer: await this.getSigner(senderAddress),
            nonce: -1,
            tip,
          },
          (result) => {
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

  // from src/hooks/helper/wallet.ts
  // @TODO: Need to refactor
  public async signAndSendWithCustomSignature({
    transaction,
    senderAddress,
    substrateAccounts,
    isCustomSignature = false,
    txResHandler,
    handleCustomExtrinsic,
    tip,
    txType,
  }: {
    transaction: SubmittableExtrinsic<'promise', ISubmittableResult>;
    senderAddress: string;
    substrateAccounts: SubstrateAccount[];
    isCustomSignature: boolean;
    txResHandler: (result: ISubmittableResult) => Promise<boolean>;
    // from: useCustomSignature.ts
    handleCustomExtrinsic?: (
      method: SubmittableExtrinsic<'promise', ISubmittableResult>
    ) => Promise<void>;
    tip?: string;
    txType?: HistoryTxType;
  }): Promise<boolean> {
    Guard.ThrowIfUndefined('transaction', transaction);
    Guard.ThrowIfUndefined('senderAddress', senderAddress);
    Guard.ThrowIfUndefined('substrateAccounts', substrateAccounts);

    return new Promise<boolean>(async (resolve) => {
      const sendSubstrateTransaction = async (): Promise<void> => {
        const injector = await getInjector(substrateAccounts);
        if (!injector) {
          throw Error('Invalid injector');
        }
        await transaction.signAndSend(
          senderAddress,
          {
            signer: injector.signer,
            nonce: -1,
            tip: tip ? ethers.utils.parseEther(String(tip)).toString() : '1',
          },
          (result) => {
            if (result.isFinalized) {
              if (!this.isExtrinsicFailed(result.events)) {
                (async () => {
                  const res = await txResHandler(result);
                  this.eventAggregator.publish(
                    new ExtrinsicStatusMessage(
                      true,
                      'Transaction successfully executed',
                      `${transaction.method.section}.${transaction.method.method}`,
                      result.txHash.toHex()
                    )
                  );

                  if (txType) {
                    addTxHistories({
                      hash: result.txHash.toString(),
                      type: txType,
                      address: senderAddress,
                    });
                  }
                  this.eventAggregator.publish(new BusyMessage(false));
                  resolve(res);
                })();
              } else {
                !result.isCompleted && this.eventAggregator.publish(new BusyMessage(true));
              }
            }
          }
        );
      };

      try {
        if (isCustomSignature && handleCustomExtrinsic) {
          await handleCustomExtrinsic(transaction);
          this.eventAggregator.publish(new BusyMessage(false));
          resolve(true);
        } else {
          await sendSubstrateTransaction();
        }
      } catch (error: any) {
        console.error(error.message);
        this.eventAggregator.publish(new ExtrinsicStatusMessage(false, error.message));
        this.eventAggregator.publish(new BusyMessage(false));
        resolve(false);
      }
    });
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
}
