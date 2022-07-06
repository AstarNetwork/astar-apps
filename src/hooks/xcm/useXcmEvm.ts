import BN from 'bn.js';
import { ethers } from 'ethers';
import { endpointKey, getProviderIndex } from 'src/config/chainEndpoints';
import xcmContractAbi from 'src/config/web3/abi/xcm-abi.json';
import { isValidAddressPolkadotAddress } from 'src/hooks/helper/plasmUtils';
import { getEvmProvider } from 'src/hooks/helper/wallet';
import { getEvmGas } from 'src/modules/gas-api';
import { useStore } from 'src/store';
import { computed, Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-eth';
import { AbiItem } from 'web3-utils';
import { getPubkeyFromSS58Addr } from '../helper/addressUtils';
import { useAccount } from '../useAccount';
import { useGasPrice } from '../useGasPrice';
import { xcmChains } from './../../modules/xcm/index';
import { ChainAsset } from './useXcmAssets';

// xcm precompiled contract address
const PRECOMPILED_ADDR = '0x0000000000000000000000000000000000005004';

export function useXcmEvm(selectedToken: Ref<ChainAsset>) {
  const store = useStore();
  const { t } = useI18n();
  const { evmGasPrice } = useGasPrice();
  const { currentAccount } = useAccount();

  const currentWallet = computed(() => store.getters['general/currentWallet']);

  const callAssetWithdrawToPara = async (
    asset_amount: string,
    recipient_account_id: string,
    finalizedCallback: () => Promise<void>
  ): Promise<string | null> => {
    return new Promise<string | null>(async (resolve) => {
      if (!asset_amount) {
        throw Error('Invalid amount');
      }

      if (!isValidAddressPolkadotAddress(recipient_account_id)) {
        throw Error('Invalid destination address');
      }

      store.commit('general/setLoading', true);

      // TODO: need refactor as more scalable later
      const asset_id = selectedToken.value.mappedERC20Addr;
      const decimal = Number(selectedToken.value.metadata.decimals);
      const assetAmount = ethers.utils.parseUnits(asset_amount, decimal).toString();
      const recipientEvmAccountId = getPubkeyFromSS58Addr(recipient_account_id);
      const assetIds = [asset_id];
      const assetAmounts = [new BN(assetAmount)];
      const recipientAccountId = recipientEvmAccountId;
      const withdrawalChain = xcmChains.find((it) => it.name === selectedToken.value.originChain);
      const isRelay = Number(withdrawalChain && withdrawalChain.parachainId) === 0;
      const parachainId = withdrawalChain?.parachainId;
      const feeIndex = 0;

      try {
        const provider = getEvmProvider(currentWallet.value);
        const web3 = new Web3(provider as any);
        const contract = new web3.eth.Contract(xcmContractAbi as AbiItem[], PRECOMPILED_ADDR);
        const [nonce, gasPrice] = await Promise.all([
          web3.eth.getTransactionCount(currentAccount.value),
          getEvmGas(web3, evmGasPrice.value.fast),
        ]);

        // console.log('assetIds', assetIds);
        // console.log('assetAmounts', assetAmounts.toString());
        // console.log('recipientAccountId', recipientAccountId);
        // console.log('isRelay', isRelay);
        // console.log('parachainId', parachainId);
        // console.log('feeIndex', feeIndex);

        const rawTx: TransactionConfig = {
          nonce,
          gasPrice: web3.utils.toHex(gasPrice),
          from: currentAccount.value,
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
            store.commit('general/setLoading', false);
            store.dispatch('general/showAlertMsg', {
              msg: t('toast.completedTxHash', { hash: transactionHash }),
              alertType: 'success',
            });
            finalizedCallback();
            resolve(transactionHash);
          });
      } catch (e: any) {
        console.error(e);
        store.commit('general/setLoading', false);
        store.dispatch('general/showAlertMsg', {
          msg: `Transaction failed with error: ${e.message}`,
          alertType: 'error',
        });
        resolve(null);
      }
    });
  };

  return {
    callAssetWithdrawToPara,
  };
}
