import { ethers } from 'ethers';
import { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer';
import { inject, injectable } from 'inversify';
import { getEvmProvider } from 'src/hooks/helper/wallet';
import { EthereumProvider } from 'src/hooks/types/CustomSignature';
import { getEvmExplorerUrl } from 'src/links';
import { AlertMsg, REQUIRED_MINIMUM_BALANCE } from 'src/modules/toast';
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
import lockdropDispatchAbi from 'src/config/web3/abi/dispatch-lockdrop.json';
import { evmPrecompiledContract } from 'src/modules/precompiled';
import { AbiItem } from 'web3-utils';

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

  // Memo: This method allows the Lockdrop account to send transactions via dispatch_lockdrop_call precompile function
  // Not all  `call` can be dispatched only the one allowed in filter:
  // - `pallet_utility::Call::**batch**` & `pallet_utility::Call::**batch_all**`  (used to batch dapp staking call for ex)
  // - `pallet_dapp_staking_v3::Call::**unbond_and_unstake**`  (the legacy unbond)
  // - `pallet_dapp_staking_v3::Call::**withdraw_unbonded**` (the legacy withdraw)
  // - `pallet_balances::Call::**transfer**` (to transfer native ASTR)
  // - `pallet_balances::Call::**transferAllowDeath**` (to transfer all the balance of native ASTR and kill the account)
  // - `pallet_balances::Call::**transferKeepAlive**` (to transfer native ASTR)
  // - `pallet_assets::Call::**transfer**` (to transfer assets of pallet assets (eg DOT))
  public async signAndSend({
    extrinsic,
    senderAddress,
    successMessage,
    finalizedCallback,
  }: ParamSignAndSend): Promise<string | null> {
    Guard.ThrowIfUndefined('extrinsic', extrinsic);
    Guard.ThrowIfUndefined('senderAddress', senderAddress);

    // Memo: No need to add claim as rewards are claimed while migration to dApp staking V3
    const allowCalls = [
      'batch',
      'batchAll',
      'transferKeepAlive',
      'transferAllowDeath',
      'transfer',
      'unbondAndUnstake',
      'withdrawUnbonded',
    ];

    try {
      return new Promise<string>(async (resolve) => {
        const web3 = new Web3(this.provider as any);
        const accounts = await web3.eth.getAccounts();
        const h160Address = accounts[0];

        const balWei = await web3.eth.getBalance(h160Address);
        const useableBalance = Number(ethers.utils.formatEther(balWei));
        const isBalanceEnough = useableBalance > REQUIRED_MINIMUM_BALANCE;
        if (!isBalanceEnough) {
          this.eventAggregator.publish(
            new ExtrinsicStatusMessage({ success: false, message: AlertMsg.MINIMUM_BALANCE })
          );
          throw new Error(AlertMsg.MINIMUM_BALANCE);
        }

        const throwError = (method: string): void => {
          const errorMsg = method + ' method is not allowed to send from the Lockdrop Account';
          this.eventAggregator.publish(
            new ExtrinsicStatusMessage({ success: false, message: errorMsg })
          );
          throw new Error(errorMsg);
        };

        const methodObj = (extrinsic.toHuman() as any).method;
        const methodName = methodObj.method as string;

        // Memo: check if there is a call that is not allowed
        if (methodName === 'batch' || methodName === 'batchAll') {
          // Memo: check if all the calls in the batch array are allowed
          methodObj.args.calls.forEach(({ method }: { method: string }) => {
            const findMethod = allowCalls.find((it: string) => it === method);
            if (!findMethod) {
              throwError(method);
            }
          });
        } else {
          const findMethod = allowCalls.find((it: string) => it === methodName);
          if (!findMethod) {
            throwError(methodName);
          }
        }

        const hexEncodedCall = extrinsic.method.toHex();
        const msg = 'Signing transaction for hex-encoded call: ' + hexEncodedCall;
        const signature = (await this.provider.request({
          method: 'personal_sign',
          params: [h160Address, msg],
        })) as string;
        const { uncompressedPubKey } = utils.recoverPublicKeyFromSig(h160Address, msg, signature);

        const contract = new web3.eth.Contract(
          lockdropDispatchAbi as AbiItem[],
          evmPrecompiledContract.lockdropDispatch
        );

        const data = contract.methods
          .dispatch_lockdrop_call(hexEncodedCall, uncompressedPubKey)
          .encodeABI();

        const hash = await this.sendEvmTransaction({
          from: h160Address,
          to: evmPrecompiledContract.lockdropDispatch,
          data,
          successMessage,
        });
        resolve(hash);
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
