import { useGasPrice, useCurrentEra, useCustomSignature } from 'src/hooks';
import { ISubmittableResult } from '@polkadot/types/types';
import { BN } from '@polkadot/util';
import { $api } from 'boot/api';
import { useStore } from 'src/store';
import { hasExtrinsicFailedEvent } from 'src/store/dapp-staking/actions';
import { computed, ref, watchEffect } from 'vue';
import { TxType } from 'src/hooks/custom-signature/message';
import { ExtrinsicPayload } from 'src/hooks/helper';
import { getIndividualClaimTxs, PayloadWithWeight } from 'src/hooks/helper/claim';
import { signAndSend } from 'src/hooks/helper/wallet';

const MAX_BATCH_WEIGHT = new BN('50000000000');

export function useClaimAll() {
  let batchTxs: PayloadWithWeight[] = [];
  const canClaim = ref<boolean>(false);
  const isLoading = ref<boolean>(true);
  const store = useStore();
  const senderAddress = computed(() => store.getters['general/selectedAddress']);
  const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);
  const dapps = computed(() => store.getters['dapps/getAllDapps']);
  const isSendingTx = computed(() => store.getters['general/isLoading']);
  const { nativeTipPrice } = useGasPrice();

  const { era } = useCurrentEra();
  const { handleResult, handleCustomExtrinsic, isCustomSig } = useCustomSignature({
    txType: TxType.dappsStaking,
  });

  watchEffect(async () => {
    try {
      isLoading.value = true;
      const api = $api;
      const senderAddressRef = senderAddress.value;
      if (!api) {
        throw Error('Failed to connect to API');
      }
      if (!senderAddressRef || !era.value || isSendingTx.value) {
        return;
      }

      const txs: PayloadWithWeight[] = await Promise.all(
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
      batchTxs = filteredTxs.flat();
      canClaim.value = batchTxs.length > 0;
    } catch (error: any) {
      console.error(error.message);
    } finally {
      isLoading.value = false;
    }
  });

  const claimAll = async (): Promise<void> => {
    const api = $api;
    const batchTxsRef = batchTxs;

    if (!api) {
      throw Error('Failed to connect to API');
    }
    if (0 >= batchTxsRef.length) {
      throw Error('No dApps can be claimed');
    }

    const txsToExecute: ExtrinsicPayload[] = [];
    let totalWeight: BN = new BN(0);
    for (let i = 0; i < batchTxsRef.length; i++) {
      const tx = batchTxsRef[i];
      if (totalWeight.add(tx.weight).gt(MAX_BATCH_WEIGHT)) {
        break;
      }

      txsToExecute.push(tx.payload as ExtrinsicPayload);
      totalWeight = totalWeight.add(tx.weight);
    }

    console.info(
      `Batch weight: ${totalWeight.toString()}, transactions no. ${txsToExecute.length}`
    );
    const transaction = api.tx.utility.batch(txsToExecute);

    try {
      const txResHandler = async (result: ISubmittableResult): Promise<boolean> => {
        const res = await handleResult(result);
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
        tip: nativeTipPrice.value.fast, //note: this is a quick hack to speed of the tx. We should add the custom speed modal later
        //tip: selectedTip.value.price,
      });
    } catch (error: any) {
      console.error(error.message);
    }
  };

  return {
    claimAll,
    canClaim,
    isLoading,
  };
}
