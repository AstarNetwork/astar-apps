import { getIndividualClaimData } from './helper/claim';
import { $api } from 'boot/api';
import { getInjector } from 'src/hooks/helper/wallet';
import { useStore } from 'src/store';
import { computed, ref, watch } from 'vue';
import { BatchTxs } from './helper';
import { useCustomSignature, useCurrentEra } from './index';

export function useClaimAll() {
  const batchTxs = ref<BatchTxs>([]);
  const numOfRewardableDapp = ref<number>(0);
  const isLoading = ref<boolean>(true);
  const store = useStore();
  const senderAddress = computed(() => store.getters['general/selectedAddress']);
  const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);
  const dapps = computed(() => store.getters['dapps/getAllDapps']);
  const isSendingTx = computed(() => store.getters['general/isLoading']);

  const { era } = useCurrentEra();
  const {
    handleResult,
    handleTransactionError,
    dispatchError,
    handleCustomExtrinsic,
    isCustomSig,
  } = useCustomSignature();

  watch(
    [$api, senderAddress, dapps, isSendingTx, era],
    async () => {
      try {
        console.log('run');
        isLoading.value = true;
        numOfRewardableDapp.value = 0;
        const api = $api.value;
        const senderAddressRef = senderAddress.value;
        if (!api) {
          throw Error('Failed to connect to API');
        }
        if (!senderAddressRef) return;

        const txs = [];
        for await (const { address } of dapps.value) {
          const data = await getIndividualClaimData({
            dappAddress: address,
            api,
            senderAddress: senderAddress.value,
            currentEra: era.value,
          }).catch((error: any) => {
            console.error(error.message);
            return { transactions: [], numberOfUnclaimedEra: undefined };
          });
          if (data.numberOfUnclaimedEra && data.numberOfUnclaimedEra > 0) {
            console.log('increase rewardable', address);
            numOfRewardableDapp.value = numOfRewardableDapp.value + 1;
          }
          txs.push(data.transactions);
        }
        batchTxs.value = txs.flat();
      } catch (error: any) {
        console.error(error.message);
      } finally {
        isLoading.value = false;
      }
    },
    { immediate: true }
  );

  const claimAll = async () => {
    const api = $api.value;
    const batchTxsRef = batchTxs.value;
    if (!api) {
      throw Error('Failed to connect to API');
    }
    if (0 >= batchTxsRef.length) {
      throw Error('No dApps can be claimed');
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
    } finally {
      batchTxs.value = [];
      numOfRewardableDapp.value = 0;
    }
  };

  return { claimAll, batchTxs, numOfRewardableDapp, isLoading };
}
