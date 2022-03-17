import { $api, $isEnableIndividualClaim } from 'boot/api';
import { getInjector } from 'src/hooks/helper/wallet';
import { useStore } from 'src/store';
import { hasExtrinsicFailedEvent } from 'src/store/dapp-staking/actions';
import { computed, ref, watchEffect } from 'vue';
import { TxType } from './custom-signature/message';
import { ExtrinsicPayload } from './helper';
import { getIndividualClaimTxs } from './helper/claim';
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
  const {
    handleResult,
    handleTransactionError,
    dispatchError,
    handleCustomExtrinsic,
    isCustomSig,
  } = useCustomSignature({ txType: TxType.dappsStaking });

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

    const sendSubstrateTransaction = async () => {
      const injector = await getInjector(substrateAccounts.value);
      await transaction
        .signAndSend(
          senderAddress.value,
          {
            signer: injector?.signer,
            // Memo: Removing it can cause subsequent transactions to fail
            nonce: -1,
          },
          (result) => {
            handleResult(result);
            hasExtrinsicFailedEvent(result.events, store.dispatch);
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

  return {
    claimAll,
    batchTxs,
    isLoading,
    isEnableIndividualClaim: $isEnableIndividualClaim,
  };
}
