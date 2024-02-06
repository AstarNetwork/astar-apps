import { ethers } from 'ethers';
import { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer';
import { inject, injectable } from 'inversify';
import { getEvmProvider } from 'src/hooks/helper/wallet';
import { EthereumProvider } from 'src/hooks/types/CustomSignature';
import { getEvmExplorerUrl, getSubscanExtrinsic } from 'src/links';
import { AlertMsg } from 'src/modules/toast';
import { Guard } from 'src/v2/common';
import { BusyMessage, ExtrinsicStatusMessage, IEventAggregator } from 'src/v2/messaging';
import { IEthCallRepository, ISystemRepository } from 'src/v2/repositories';
import {
  IGasPriceProvider,
  IWalletService,
  ParamSendEvmTransaction,
  ParamSignAndSend,
} from 'src/v2/services';
import { WalletService } from 'src/v2/services/implementations';
import { Symbols } from 'src/v2/symbols';
import Web3 from 'web3';
import { getRawEvmTransaction } from 'src/modules/evm';
import * as utils from 'src/hooks/custom-signature/utils';

@injectable()
export class MetamaskWalletService extends WalletService implements IWalletService {
  private provider!: EthereumProvider;

  constructor(
    @inject(Symbols.SystemRepository) private systemRepository: ISystemRepository,
    @inject(Symbols.EthCallRepository) private ethCallRepository: IEthCallRepository,
    @inject(Symbols.EventAggregator) eventAggregator: IEventAggregator,
    @inject(Symbols.CurrentWallet) private currentWallet: string,
    @inject(Symbols.GasPriceProvider) private gasPriceProvider: IGasPriceProvider
  ) {
    super(eventAggregator);

    const ethProvider = getEvmProvider(currentWallet as any);

    if (ethProvider) {
      this.provider = ethProvider;
    } else {
      Guard.ThrowIfUndefined('provider', this.provider);
    }
  }

  // Todo: update the logic to use dispatch_lockdrop_call function
  public async signAndSend({
    extrinsic,
    senderAddress,
    successMessage,
    finalizedCallback,
  }: ParamSignAndSend): Promise<string | null> {
    Guard.ThrowIfUndefined('extrinsic', extrinsic);
    Guard.ThrowIfUndefined('senderAddress', senderAddress);

    console.log('extrinsic', extrinsic);
    console.log('extrinsic', extrinsic.toHuman());

    try {
      return new Promise<string>(async (resolve) => {
        const account = await this.systemRepository.getAccountInfo(senderAddress);
        // const payload = await this.ethCallRepository.getPayload(extrinsic, account.nonce);
        const payload = undefined;

        const web3 = new Web3(this.provider as any);
        const accounts = await web3.eth.getAccounts();

        const msg = 'Some message for sending transaction';
        const signature = (await this.provider.request({
          method: 'personal_sign',
          params: [account, msg],
        })) as string;
        const pubKey = utils.recoverPublicKeyFromSig(accounts[0], msg, signature);
        console.log('pubKey', pubKey);

        // Todo: we have to change the logic from here to use dispatch_lockdrop_call
        const signedPayload = await this.provider.request({
          method: 'personal_sign',
          params: [accounts[0], payload],
        });

        const call = await this.ethCallRepository.getCall(
          extrinsic,
          senderAddress,
          signedPayload as string,
          account.nonce
        );

        const unsub = await call.send((result) => {
          try {
            if (result.isCompleted) {
              if (!this.isExtrinsicFailed(result.events)) {
                const explorerUrl = getSubscanExtrinsic({ hash: result.txHash.toHex() });
                this.eventAggregator.publish(
                  new ExtrinsicStatusMessage({
                    success: true,
                    message: successMessage ?? AlertMsg.SUCCESS,
                    method: `${extrinsic.method.section}.${extrinsic.method.method}`,
                    explorerUrl,
                  })
                );
              }

              this.eventAggregator.publish(new BusyMessage(false));
              if (finalizedCallback) {
                finalizedCallback(result);
              }
              resolve(result.txHash.toHex());
              unsub();
            } else {
              this.eventAggregator.publish(new BusyMessage(true));
            }
          } catch (error) {
            this.eventAggregator.publish(new BusyMessage(false));
            unsub();
          }
        });
      });
    } catch (e) {
      const error = e as unknown as Error;
      this.eventAggregator.publish(
        new ExtrinsicStatusMessage({
          success: false,
          message: error.message || AlertMsg.ERROR,
        })
      );
      this.eventAggregator.publish(new BusyMessage(false));
      throw Error(error.message);
    }
  }

  public async sendEvmTransaction({
    from,
    to,
    value,
    data,
    successMessage,
    failureMessage,
  }: ParamSendEvmTransaction): Promise<string> {
    try {
      const web3 = new Web3(this.provider as any);
      const rawTx = await getRawEvmTransaction(web3, from, to, data, value);

      // Memo: passing this variable (estimatedGas) to `sendTransaction({gas: estimatedGas})` causes an error when sending `withdrawal` transactions.
      // the function goes the catch statement if something goes wrong while getting the estimatedGas. This way, the UI prevents sending invalid transactions which could cause loss of assets.
      const estimatedGas = await web3.eth.estimateGas(rawTx);
      const transactionHash = await web3.eth
        .sendTransaction({ ...rawTx })
        .once('transactionHash', (transactionHash) => {
          this.eventAggregator.publish(new BusyMessage(true));
        })
        .then(async ({ transactionHash }) => {
          const explorerUrl = await getEvmExplorerUrl(transactionHash, web3);
          this.eventAggregator.publish(new BusyMessage(false));
          this.eventAggregator.publish(
            new ExtrinsicStatusMessage({
              success: true,
              message: successMessage ? successMessage : AlertMsg.SUCCESS,
              explorerUrl,
            })
          );
          return transactionHash;
        })
        .catch((error: any) => {
          console.error(error);
          this.eventAggregator.publish(new BusyMessage(false));
          this.eventAggregator.publish(
            new ExtrinsicStatusMessage({
              success: false,
              message: error.message || AlertMsg.ERROR,
            })
          );
          return AlertMsg.ERROR;
        });
      return transactionHash;
    } catch (error: any) {
      this.eventAggregator.publish(
        new ExtrinsicStatusMessage({
          success: false,
          message: failureMessage || error.message,
        })
      );
      return AlertMsg.ERROR;
    }
  }

  public async signPayload(
    domain: TypedDataDomain,
    types: Record<string, Array<TypedDataField>>,
    value: Record<string, any>
  ): Promise<string> {
    Guard.ThrowIfUndefined('domain', domain);
    Guard.ThrowIfUndefined('types', types);
    Guard.ThrowIfUndefined('value', value);

    const provider = new ethers.providers.Web3Provider(this.provider);
    const signer = provider.getSigner();
    const signature = await signer._signTypedData(domain, types, value);

    return signature;
  }
}
