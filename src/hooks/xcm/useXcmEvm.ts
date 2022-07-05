import BN from 'bn.js';
import { ethers } from 'ethers';
import { endpointKey, getProviderIndex } from 'src/config/chainEndpoints';
import xcmContractAbi from 'src/config/web3/abi/xcm-abi.json';
import { isValidAddressPolkadotAddress } from 'src/hooks/helper/plasmUtils';
import { getEvmProvider } from 'src/hooks/helper/wallet';
import { getEvmGas } from 'src/modules/gas-api';
import { DOT, KSM } from 'src/modules/token';
import { useStore } from 'src/store';
import { computed, Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-eth';
import { AbiItem } from 'web3-utils';
import { getPubkeyFromSS58Addr } from '../helper/addressUtils';
import { useGasPrice } from '../useGasPrice';

// xcm precompiled contract address
const PRECOMPILED_ADDR = '0x0000000000000000000000000000000000005004';

export function useXcmEvm(addressRef: Ref<string>) {
  const store = useStore();
  const { t } = useI18n();
  const { evmGasPrice } = useGasPrice();

  const currentNetworkIdx = computed(() => {
    const chainInfo = store.getters['general/chainInfo'];
    const chain = chainInfo ? chainInfo.chain : '';
    return getProviderIndex(chain);
  });
  const isAstar = computed(() => currentNetworkIdx.value === endpointKey.ASTAR);
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
      let asset_id = KSM.address;
      let decimal = KSM.decimal;
      if (isAstar.value) {
        asset_id = DOT.address;
        decimal = DOT.decimal;
      }
      const assetAmount = ethers.utils.parseUnits(asset_amount, decimal).toString();
      const recipientEvmAccountId = getPubkeyFromSS58Addr(recipient_account_id);
      const assetIds = [asset_id];
      const assetAmounts = [new BN(assetAmount)];
      const recipientAccountId = recipientEvmAccountId;
      const isRelay = true;
      const parachainId = 0;
      const feeIndex = 0;

      try {
        const provider = getEvmProvider(currentWallet.value);
        const web3 = new Web3(provider as any);
        const contract = new web3.eth.Contract(xcmContractAbi as AbiItem[], PRECOMPILED_ADDR);
        const [nonce, gasPrice] = await Promise.all([
          web3.eth.getTransactionCount(addressRef.value),
          getEvmGas(web3, evmGasPrice.value.fast),
        ]);

        const rawTx: TransactionConfig = {
          nonce,
          gasPrice: web3.utils.toHex(gasPrice),
          from: addressRef.value,
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
