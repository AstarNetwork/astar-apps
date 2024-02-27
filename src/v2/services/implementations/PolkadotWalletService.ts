import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { InjectedExtension } from '@polkadot/extension-inject/types';
import { Signer } from '@polkadot/types/types';
import { createKeyMulti, encodeAddress } from '@polkadot/util-crypto';
import { ethers } from 'ethers';
import { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer';
import { inject, injectable } from 'inversify';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { isMobileDevice } from 'src/hooks/helper/wallet';
import { getSubscanExtrinsic, polkasafeUrl } from 'src/links';
import { AlertMsg, REQUIRED_MINIMUM_BALANCE } from 'src/modules/toast/index';
import { Guard, wait } from 'src/v2/common';
import { BusyMessage, ExtrinsicStatusMessage, IEventAggregator } from 'src/v2/messaging';
import { Account } from 'src/v2/models';
import {
  IGasPriceProvider,
  IWalletService,
  ParamSendEvmTransaction,
  ParamSendMultisigTransaction,
  ParamSignAndSend,
} from 'src/v2/services';
import { PolkasafeRepository } from 'src/v2/repositories/implementations';
import { IAssetsRepository, IMetadataRepository } from 'src/v2/repositories';
import { Symbols } from 'src/v2/symbols';
import { WalletService } from './WalletService';
import { ASTAR_SS58_FORMAT, hasProperty } from '@astar-network/astar-sdk-core';
import { IApi } from 'src/v2/integration';
import { SupportWallet } from 'src/config/wallets';

@injectable()
export class PolkadotWalletService extends WalletService implements IWalletService {
  private readonly extensions: InjectedExtension[] = [];

  constructor(
    @inject(Symbols.PolkasafeRepository) private readonly polkasafeClient: PolkasafeRepository,
    @inject(Symbols.MetadataRepository) private readonly metadataRepository: IMetadataRepository,
    @inject(Symbols.EventAggregator) readonly eventAggregator: IEventAggregator,
    @inject(Symbols.GasPriceProvider) private readonly gasPriceProvider: IGasPriceProvider,
    @inject(Symbols.DefaultApi) protected api: IApi,
    @inject(Symbols.AssetsRepository) private assetsRepository: IAssetsRepository
  ) {
    super(eventAggregator);
  }

  /**
   * Signs given transaction.
   * @param extrinsic Transaction to sign.
   * @param senderAddress Sender address.
   * @param successMessage Mesage to be displayed to user in case of successful transaction.
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

    const isDetectExtensionsAction = this.checkIsDetectableWallet();

    let result: string | null = null;
    try {
      return new Promise<string>(async (resolve, reject) => {
        isDetectExtensionsAction && this.detectExtensionsAction(true);

        const useableBalance = await this.assetsRepository.getNativeBalance(senderAddress);
        const isBalanceEnough =
          Number(ethers.utils.formatEther(useableBalance)) > REQUIRED_MINIMUM_BALANCE;
        if (!isBalanceEnough) {
          this.eventAggregator.publish(
            new ExtrinsicStatusMessage({ success: false, message: AlertMsg.MINIMUM_BALANCE })
          );
          throw new Error(AlertMsg.MINIMUM_BALANCE);
        }

        await this.checkExtension();
        let tip = transactionTip?.toString();
        if (!tip) {
          tip = this.gasPriceProvider.getTip().price;
          tip = tip ? ethers.utils.parseEther(tip).toString() : '1';
        }

        const multisig = localStorage.getItem(LOCAL_STORAGE.MULTISIG);
        if (multisig) {
          try {
            const callHash = await this.sendMultisigTransaction({
              multisig,
              senderAddress,
              tip,
              extrinsic,
            });
            resolve(callHash);
          } catch (error: any) {
            const isDuplicatedTx = error.message.includes('AlreadyApproved');
            const message = isDuplicatedTx
              ? AlertMsg.ERROR_DUPLICATED_TX
              : error.message
              ? error.message
              : AlertMsg.ERROR;
            this.eventAggregator.publish(new ExtrinsicStatusMessage({ success: false, message }));
            this.eventAggregator.publish(new BusyMessage(false));
            resolve(error.message);
          }
        } else {
          try {
            const unsub = await extrinsic.signAndSend(
              senderAddress,
              {
                signer: await this.getSigner(senderAddress),
                nonce: -1,
                tip,
              },
              (result) => {
                try {
                  isDetectExtensionsAction
                    ? this.detectExtensionsAction(false)
                    : this.eventAggregator.publish(new BusyMessage(true));

                  if (result.isCompleted) {
                    if (!this.isExtrinsicFailed(result.events)) {
                      if (result.isError) {
                        this.eventAggregator.publish(
                          new ExtrinsicStatusMessage({ success: false, message: AlertMsg.ERROR })
                        );
                      } else {
                        const subscanUrl = getSubscanExtrinsic({
                          subscanBase: subscan,
                          hash: result.txHash.toHex(),
                        });
                        this.eventAggregator.publish(
                          new ExtrinsicStatusMessage({
                            success: true,
                            message: successMessage ?? AlertMsg.SUCCESS,
                            method: `${extrinsic.method.section}.${extrinsic.method.method}`,
                            explorerUrl: subscanUrl,
                          })
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
                  reject(error as Error);
                }
              }
            );
          } catch (error) {
            reject(error as Error);
          }
        }
      });
    } catch (e) {
      const error = e as unknown as Error;
      this.eventAggregator.publish(
        new ExtrinsicStatusMessage({ success: false, message: error.message || AlertMsg.ERROR })
      );
      this.eventAggregator.publish(new BusyMessage(false));
    }

    return result;
  }

  public async signPayload(
    domain: TypedDataDomain,
    types: Record<string, Array<TypedDataField>>,
    value: Record<string, any>
  ): Promise<string> {
    throw new Error('Method not implemented.');
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

  // Memo: this helper method is used to display the loading animation while sending transactions
  private checkIsDetectableWallet(): boolean {
    const selectedWallet = String(
      localStorage.getItem(LOCAL_STORAGE.SELECTED_WALLET)
    ) as SupportWallet;

    // Memo: Wallets which are not be able to tell the sending transaction status via events
    const notDetectableWallet = [
      SupportWallet.EnkryptNative,
      SupportWallet.Snap,
      SupportWallet.Math,
    ];

    const isDetectable = !notDetectableWallet.includes(selectedWallet);
    return !isMobileDevice && isDetectable;
  }

  // Memo: detects status in the wallet extension
  // Ref: https://github.com/polkadot-js/extension/issues/674
  // Ref: https://github.com/polkadot-js/extension/blob/297b2af14c68574b24bb8fdeda2208c473eccf43/packages/extension/src/page.ts#L10-L22
  private detectExtensionsAction(isMonitorExtension: boolean): void {
    const handleDetectSign = (listener: any): void => {
      const { source, data } = listener;
      if (source !== window || !data.origin) {
        return;
      }
      if (data.id) {
        if (data.response && hasProperty(data.response, 'signature')) {
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

  // Memo: This method is not called from this class
  public async sendEvmTransaction({
    from,
    to,
    value,
    data,
  }: ParamSendEvmTransaction): Promise<string> {
    return '';
  }

  private async sendMultisigTransaction({
    multisig,
    senderAddress,
    tip,
    extrinsic,
  }: ParamSendMultisigTransaction): Promise<string> {
    this.eventAggregator.publish(new BusyMessage(true));
    const account = JSON.parse(multisig);
    let multisigAddress = senderAddress;
    const isProxyAccount = Boolean(account.multisigAccount.isProxyAccount);
    if (isProxyAccount) {
      // Memo: get the multisig address of the proxy account
      const multiAddress = createKeyMulti(
        account.multisigAccount.signatories,
        account.multisigAccount.threshold
      );
      multisigAddress = encodeAddress(multiAddress, ASTAR_SS58_FORMAT);
      const bal = await this.assetsRepository.getNativeBalance(multisigAddress);
      if (Number(bal) === 0) {
        throw Error(`Please add Existential Deposit to ${multisigAddress}`);
      }
    }
    const callHash = await this.polkasafeClient.sendMultisigTransaction({
      multisigAddress,
      transaction: extrinsic,
      isProxyAccount,
      tip,
    });
    // Memo: give some time to wait for listing the transaction on PolkaSafe portal (queue page), so that users won't need to refresh the page to find the transaction for approving
    const syncTime = 1000 * 10;
    await wait(syncTime);

    this.eventAggregator.publish(
      new ExtrinsicStatusMessage({
        success: true,
        message: AlertMsg.SUCCESS_MULTISIG,
        method: `${extrinsic.method.section}.${extrinsic.method.method}`,
        explorerUrl: polkasafeUrl + '/transactions?tab=Queue#' + callHash,
      })
    );
    this.eventAggregator.publish(new BusyMessage(false));
    return callHash;
  }
}
