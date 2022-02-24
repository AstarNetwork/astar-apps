import { $api } from 'boot/api';
import { getInjector } from 'src/hooks/helper/wallet';
import { useStore } from 'src/store';
import { computed, ref, watchEffect } from 'vue';
import { BatchTxs } from './helper';
import { getIndividualClaimData } from './helper/claim';
import { useCurrentEra, useCustomSignature } from './index';

export function useIndividualClaim(dappAddress: string) {
  const numOfUnclaimedEra = ref<number | undefined>(undefined);
  const batchTxs = ref<BatchTxs>([]);

  const store = useStore();
  const senderAddress = computed(() => store.getters['general/selectedAddress']);
  const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);
  const { era } = useCurrentEra();

  const {
    handleResult,
    handleTransactionError,
    dispatchError,
    handleCustomExtrinsic,
    isCustomSig,
  } = useCustomSignature();

  watchEffect(async () => {
    const api = $api.value;
    if (!api) {
      throw Error('Failed to connect to API');
    }
    if (!senderAddress.value || !era.value) return;

    const data = await getIndividualClaimData({
      dappAddress,
      api,
      senderAddress: senderAddress.value,
      currentEra: era.value,
    }).catch((error: any) => {
      console.error(error.message);
      return { transactions: [], numberOfUnclaimedEra: undefined };
    });

    numOfUnclaimedEra.value = data.numberOfUnclaimedEra;
    batchTxs.value = data.transactions;
  });

  const individualClaim = async () => {
    const api = $api.value;
    const batchTxsRef = batchTxs.value;
    if (!api) {
      throw Error('Failed to connect to API');
    }
    if (batchTxsRef.length === 0) {
      throw Error('There is no transaction for claiming');
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

  return { individualClaim, numOfUnclaimedEra };
}
