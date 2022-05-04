import { ISubmittableResult } from '@polkadot/types/types';
import { $api, $isEnableIndividualClaim } from 'boot/api';
import { useStore } from 'src/store';
import { hasExtrinsicFailedEvent } from 'src/modules/extrinsic';
import { computed, ref, watchEffect } from 'vue';
import { TxType } from './custom-signature/message';
import { ExtrinsicPayload } from './helper';
import { getIndividualClaimTxs } from './helper/claim';
import { signAndSend } from './helper/wallet';
import { useCurrentEra, useCustomSignature } from './index';

export function useClaimAll() {
  const batchTxs = ref<ExtrinsicPayload[]>([]);
  const isLoading = ref<boolean>(true);
  const store = useStore();
  const senderAddress = computed(() => store.getters['general/selectedAddress']);
  const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);
  const dapps = computed(() => store.getters['dapps/getAllDapps']);
  const isSendingTx = computed(() => store.getters['general/isLoading']);

  const { era } = useCurrentEra();
  const { handleResult, handleCustomExtrinsic, isCustomSig } = useCustomSignature({
    txType: TxType.dappsStaking,
  });

  watchEffect(async () => {
    try {
      isLoading.value = true;
      batchTxs.value = [];
      const api = $api.value;
      const senderAddressRef = senderAddress.value;
      if (!api) {
        throw Error('Failed to connect to API');
      }
      if (!senderAddressRef || !era.value || isSendingTx.value || !$isEnableIndividualClaim.value) {
        return;
      }

      const txs: ExtrinsicPayload[] = await Promise.all(
        dapps.value.map(async ({ address }: { address: string }) => {
          const transactions = await getIndividualClaimTxs({
            dappAddress: address,
            api,
            senderAddress: senderAddressRef,
            currentEra: era.value,
          });
          return transactions.length ? transactions : null;
        })
      );
      const filteredTxs = txs.filter((it) => it !== null);
      batchTxs.value = filteredTxs.flat();
    } catch (error: any) {
      console.error(error.message);
    } finally {
      isLoading.value = false;
    }
  });

  const claimAll = async (): Promise<void> => {
    const api = $api.value;
    const batchTxsRef = batchTxs.value;
    if (!api) {
      throw Error('Failed to connect to API');
    }
    if (0 >= batchTxsRef.length) {
      throw Error('No dApps can be claimed');
    }

    const transaction = api.tx.utility.batch(batchTxsRef);

    const txResHandler = async (result: ISubmittableResult): Promise<boolean> => {
      const res = handleResult(result);
      hasExtrinsicFailedEvent(result.events, store.dispatch);
      return res;
    };

    await signAndSend({
      transaction,
      senderAddress: senderAddress.value,
      substrateAccounts: substrateAccounts.value,
      isCustomSignature: isCustomSig.value,
      txResHandler,
      handleCustomExtrinsic,
      dispatch: store.dispatch,
    });
  };

  return {
    claimAll,
    batchTxs,
    isLoading,
    isEnableIndividualClaim: $isEnableIndividualClaim,
  };
}
