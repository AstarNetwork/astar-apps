import { BN } from '@polkadot/util';
import { ethers } from 'ethers';
import { inject, injectable } from 'inversify';
import xcmContractAbi from 'src/config/web3/abi/xcm-abi.json';
import moonbeamWithdrawalAbi from 'src/config/web3/abi/xcm-moonbeam-withdrawal-abi.json';
import {
  isValidAddressPolkadotAddress,
  getEvmGas,
  getPubkeyFromSS58Addr,
  isValidEvmAddress,
} from '@astar-network/astar-sdk-core';
import { getEvmProvider } from 'src/hooks/helper/wallet';
import { relaychainParaId, xcmChainObj } from 'src/modules/xcm';
import { Guard } from 'src/v2/common';
import { BusyMessage, ExtrinsicStatusMessage, IEventAggregator } from 'src/v2/messaging';
import { Chain, ethWalletChains } from 'src/v2/models';
import { IGasPriceProvider, IXcmEvmService, TransferParam } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-eth';
import { AbiItem } from 'web3-utils';
import { AlertMsg } from 'src/modules/toast';
import { getBlockscoutTx } from 'src/links';

// XCM precompiled contract address
const PRECOMPILED_ADDR = '0x0000000000000000000000000000000000005004';

@injectable()
export class XcmEvmService implements IXcmEvmService {
  constructor(
    @inject(Symbols.EventAggregator) private eventAggregator: IEventAggregator,
    @inject(Symbols.GasPriceProvider) private gasPriceProvider: IGasPriceProvider,
    @inject(Symbols.CurrentWallet) private currentWallet: string
  ) {}

  public async transfer({
    from,
    to,
    token,
    senderAddress,
    recipientAddress,
    amount,
    finalizedCallback,
    successMessage,
  }: TransferParam): Promise<void> {
    Guard.ThrowIfUndefined('recipientAddress', recipientAddress);
    Guard.ThrowIfNegative('amount', amount);

    const isMoonbeamWithdrawal = ethWalletChains.includes(to.name);

    const ABI = isMoonbeamWithdrawal ? moonbeamWithdrawalAbi : xcmContractAbi;

    const isValidDestAddress =
      (!isMoonbeamWithdrawal && isValidAddressPolkadotAddress(recipientAddress)) ||
      (isMoonbeamWithdrawal && isValidEvmAddress(recipientAddress));
    if (!isValidDestAddress) {
      throw Error('Invalid destination address');
    }

    return new Promise<void>(async (resolve, reject) => {
      this.eventAggregator.publish(new BusyMessage(true));

      const asset_id = token.mappedERC20Addr;
      const decimal = token.metadata.decimals;
      const assetAmount = ethers.utils.parseUnits(amount.toString(), decimal).toString();
      const recipientEvmAccountId = getPubkeyFromSS58Addr(recipientAddress);
      const assetIds = [asset_id];
      const assetAmounts = [new BN(assetAmount)];
      const recipientAccountId = recipientEvmAccountId;
      const withdrawalChain = xcmChainObj[token.originChain as Chain];
      const isRelay = Number(withdrawalChain && withdrawalChain.parachainId) === relaychainParaId;
      const parachainId = withdrawalChain?.parachainId ?? 0;
      const feeIndex = 0;

      try {
        const provider = getEvmProvider(this.currentWallet as any);
        const web3 = new Web3(provider as any);
        const contract = new web3.eth.Contract(ABI as AbiItem[], PRECOMPILED_ADDR);

        const [nonce, gasPrice] = await Promise.all([
          web3.eth.getTransactionCount(senderAddress),
          getEvmGas(web3, this.gasPriceProvider.getGas().price),
        ]);

        const rawTx: TransactionConfig = {
          nonce,
          gasPrice: web3.utils.toHex(gasPrice),
          from: senderAddress,
          to: PRECOMPILED_ADDR,
          value: '0x0',
          data: contract.methods
            .assets_withdraw(
              assetIds,
              assetAmounts,
              recipientAccountId,
              isRelay,
              parachainId,
              feeIndex
            )
            .encodeABI(),
        };

        const estimatedGas = await web3.eth.estimateGas(rawTx);
        await web3.eth
          .sendTransaction({ ...rawTx, gas: estimatedGas })
          .then(async ({ transactionHash }) => {
            const explorerUrl = getBlockscoutTx(transactionHash);
            this.eventAggregator.publish(new BusyMessage(false));
            this.eventAggregator.publish(
              new ExtrinsicStatusMessage({ success: true, message: successMessage, explorerUrl })
            );
            finalizedCallback && (await finalizedCallback(transactionHash));
            resolve();
          });
      } catch (e: any) {
        console.error(e);
        this.eventAggregator.publish(new BusyMessage(false));
        this.eventAggregator.publish(
          new ExtrinsicStatusMessage({ success: false, message: `${AlertMsg.ERROR}: ${e.message}` })
        );
        reject(e);
      }
    });
  }
}
