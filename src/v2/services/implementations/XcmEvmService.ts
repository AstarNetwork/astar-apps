import { BN } from '@polkadot/util';
import { ethers } from 'ethers';
import { AbiItem } from 'web3-utils';
import { TransactionConfig } from 'web3-eth';
import Web3 from 'web3';
import { inject, injectable } from 'inversify';
import { getPubkeyFromSS58Addr } from 'src/hooks/helper/addressUtils';
import { getEvmProvider } from 'src/hooks/helper/wallet';
import { Guard } from 'src/v2/common';
import { BusyMessage, ExtrinsicStatusMessage, IEventAggregator } from 'src/v2/messaging';
import { Asset } from 'src/v2/models';
import { Symbols } from 'src/v2/symbols';
import { IXcmEvmService, IGasPriceProvider } from 'src/v2/services';
import xcmContractAbi from 'src/config/web3/abi/xcm-abi.json';
import { getEvmGas } from 'src/modules/gas-api';
import { addXcmTxHistories, Chain, relaychainParaId, XcmChain, xcmChainObj } from 'src/modules/xcm';
import { GLMR, MOVR } from 'src/modules/token';
import moonbeamWithdrawalAbi from 'src/config/web3/abi/xcm-moonbeam-withdrawal-abi.json';
import { isValidAddressPolkadotAddress } from 'src/hooks/helper/plasmUtils';
import { isValidEvmAddress } from 'src/config/web3';
import { pathEvm } from 'src/hooks';

// XCM precompiled contract address
const PRECOMPILED_ADDR = '0x0000000000000000000000000000000000005004';

@injectable()
export class XcmEvmService implements IXcmEvmService {
  constructor(
    @inject(Symbols.EventAggregator) private eventAggregator: IEventAggregator,
    @inject(Symbols.GasPriceProvider) private gasPriceProvider: IGasPriceProvider,
    @inject(Symbols.CurrentWallet) private currentWallet: string
  ) {}

  public async transfer(
    from: XcmChain,
    to: XcmChain,
    token: Asset,
    senderAddress: string,
    recipientAddress: string,
    amount: number
  ): Promise<string | null> {
    Guard.ThrowIfUndefined('recipientAddress', recipientAddress);
    Guard.ThrowIfNegative('amount', amount);

    const moonbeamTokens = [MOVR.address.toLowerCase(), GLMR.address.toLowerCase()];
    const isMoonbeamWithdrawal = moonbeamTokens.includes(token.mappedERC20Addr.toLowerCase());

    const ABI = isMoonbeamWithdrawal ? moonbeamWithdrawalAbi : xcmContractAbi;

    const isValidDestAddress =
      (!isMoonbeamWithdrawal && isValidAddressPolkadotAddress(recipientAddress)) ||
      (isMoonbeamWithdrawal && isValidEvmAddress(recipientAddress));
    if (!isValidDestAddress) {
      throw Error('Invalid destination address');
    }

    return new Promise<string>(async (resolve, reject) => {
      this.eventAggregator.publish(new BusyMessage(true));

      const asset_id = token.mappedERC20Addr;
      const decimal = token.metadata.decimals;
      const assetAmount = ethers.utils.parseUnits(amount.toString(), decimal).toString();
      const recipientEvmAccountId = getPubkeyFromSS58Addr(recipientAddress);
      const assetIds = [asset_id];
      const assetAmounts = [new BN(assetAmount)];
      const recipientAccountId = recipientEvmAccountId;
      // const withdrawalChain = XcmConfiguration.find((x) => x.chain === token.originChain);
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

        // console.log('assetIds', assetIds);
        // console.log('assetAmounts', assetAmounts.toString());
        // console.log('recipientAccountId', recipientAccountId);
        // console.log('isRelay', isRelay);
        // console.log('parachainId', parachainId);
        // console.log('feeIndex', feeIndex);
        // console.log('isMoonbeamWithdrawal', isMoonbeamWithdrawal);

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
          .then(({ transactionHash }) => {
            this.eventAggregator.publish(new BusyMessage(false));
            this.eventAggregator.publish(
              new ExtrinsicStatusMessage(
                true,
                `Completed at transaction hash #${transactionHash}`, //TODO implement translation service.
                'evmXcm',
                transactionHash
              )
            );
            addXcmTxHistories({
              hash: transactionHash,
              from: from.name + pathEvm,
              to: to.name,
              symbol: token.metadata.symbol,
              amount: amount.toString(),
              address: senderAddress,
            });
            resolve(transactionHash);
          });
      } catch (e: any) {
        console.error(e);
        this.eventAggregator.publish(new BusyMessage(false));
        this.eventAggregator.publish(
          new ExtrinsicStatusMessage(false, `Transaction failed with error: ${e.message}`)
        );
        reject(e);
      }
    });
  }
}
