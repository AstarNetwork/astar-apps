import { $api } from 'boot/api';
import { getInjector } from 'src/hooks/helper/wallet';
import { useStore } from 'src/store';
import { computed, ref, watchEffect } from 'vue';
import { useCustomSignature } from './index';
import { BatchTxs } from './helper';
import { getClaimStakerData, handleGetClaimDappData } from './helper/claim';

export function useIndividualClaim(dappAddress: string) {
  const claimDappTxs = ref<BatchTxs>([]);
  const store = useStore();
  const senderAddress = computed(() => store.getters['general/selectedAddress']);
  const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);

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
    claimDappTxs.value = await handleGetClaimDappData({ address: dappAddress, api }).catch(
      (error: any) => {
        console.error(error.message);
        return [];
      }
    );
  });

  const individualClaim = async () => {
    const api = $api.value;
    if (!api) {
      throw Error('Failed to connect to API');
    }

    const stakerData = getClaimStakerData({ address: dappAddress, api });
    if (!stakerData) {
      throw Error('No rewards to claim');
    }
    const batchTxs = claimDappTxs.value;
    batchTxs.push(stakerData);
    const transaction = api.tx.utility.batch(batchTxs);

    try {
      if (isCustomSig.value) {
        await handleCustomExtrinsic(transaction);
      } else {
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
      }
    } catch (error: any) {
      console.error(error.message);
      dispatchError(error.message);
    }
  };

  return { individualClaim };
}
