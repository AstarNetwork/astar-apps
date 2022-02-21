import { $api } from 'boot/api';
import { getInjector } from 'src/hooks/helper/wallet';
import { useStore } from 'src/store';
import { computed, ref, watchEffect } from 'vue';
import { BatchTxs } from './helper';
import { checkIsStakerData, getClaimStakerData, handleGetClaimDappData } from './helper/claim';
import { useCustomSignature } from './index';

export function useClaimAll() {
  const batchTxs = ref<BatchTxs>([]);
  const isLoading = ref<boolean>(true);
  const store = useStore();
  const senderAddress = computed(() => store.getters['general/selectedAddress']);
  const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);
  const dapps = computed(() => store.getters['dapps/getAllDapps']);

  const {
    handleResult,
    handleTransactionError,
    dispatchError,
    handleCustomExtrinsic,
    isCustomSig,
  } = useCustomSignature();

  watchEffect(async () => {
    try {
      isLoading.value = true;
      const api = $api.value;
      const senderAddressRef = senderAddress.value;
      if (!api) {
        throw Error('Failed to connect to API');
      }
      if (!senderAddressRef) return;

      const txs = [];
      for await (const { address } of dapps.value) {
        const results = await Promise.all([
          handleGetClaimDappData({ address, api }),
          checkIsStakerData({
            senderAddress: senderAddressRef,
            dappAddress: address,
            api,
          }),
        ]);
        const dappData = results[0];
        const isEligibleClaimStaker = results[1];
        if (dappData.length) {
          txs.push(dappData);
        }
        if (isEligibleClaimStaker) {
          const stakerData = getClaimStakerData({ address, api });
          txs.push(stakerData);
        }
      }
      batchTxs.value = txs.flat();
    } catch (error: any) {
      console.error(error.message);
    } finally {
      isLoading.value = false;
    }
  });

  const claimAll = async () => {
    const api = $api.value;
    const batchTxsRef = batchTxs.value;
    const isLoadingRef = isLoading.value;
    if (!api) {
      throw Error('Failed to connect to API');
    }
    if (isLoadingRef) {
      throw Error('Waiting for calculation');
    }
    if (0 >= batchTxsRef.length) {
      throw Error('No dApp can be claimed');
    }

    const transaction = api.tx.utility.batch(batchTxsRef);

    const sendSubstrateTransaction = async () => {
      const injector = await getInjector(substrateAccounts.value);
      await transaction
        .signAndSend(
          senderAddress.value,
          {
            signer: injector?.signer,
            // Memo: check if it is ok to remove nonce: -1
            nonce: -1,
          },
          (result) => {
            handleResult(result);
          }
        )
        .catch((error: Error) => {
          handleTransactionError(error);
        });
    };

    try {
      if (isCustomSig.value) {
        await handleCustomExtrinsic(transaction);
      } else {
        await sendSubstrateTransaction();
      }
    } catch (error: any) {
      console.error(error.message);
      dispatchError(error.message);
    }
  };

  return { claimAll, isLoading };
}
