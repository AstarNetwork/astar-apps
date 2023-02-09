import { ISubmittableResult } from '@polkadot/types/types';
import { BN } from '@polkadot/util';
import { $api } from 'boot/api';
import { useCurrentEra } from 'src/hooks';
import { displayCustomMessage, TxType } from 'src/hooks/custom-signature/message';
import { ExtrinsicPayload } from 'src/hooks/helper';
import { getIndividualClaimTxs, PayloadWithWeight } from 'src/hooks/helper/claim';
import { useStore } from 'src/store';
import { container } from 'src/v2/common';
import { DappCombinedInfo } from 'src/v2/models/DappsStaking';
import { IDappStakingService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { computed, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

const MAX_BATCH_WEIGHT = new BN('50000000000');

export function useClaimAll() {
  let batchTxs: PayloadWithWeight[] = [];
  const amountOfEras = ref<number>(0);
  const canClaim = ref<boolean>(false);
  const canClaimWithoutError = ref<boolean>(true);
  const isLoading = ref<boolean>(true);
  const store = useStore();
  const senderAddress = computed(() => store.getters['general/selectedAddress']);
  const dapps = computed<DappCombinedInfo[]>(() => store.getters['dapps/getAllDapps']);
  const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
  const isSendingTx = computed(() => store.getters['general/isLoading']);
  const { t } = useI18n();
  const { era } = useCurrentEra();

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

      const txs = await Promise.all(
        dapps.value.map(async (it) => {
          if (it.dapp && !isH160.value) {
            const transactions = await getIndividualClaimTxs({
              dappAddress: it?.dapp?.address,
              api,
              senderAddress: senderAddressRef,
              currentEra: era.value,
            });
            return transactions.length ? transactions : null;
          } else {
            return null;
          }
        })
      );
      const filteredTxs = txs.filter((it) => it !== null);
      batchTxs = filteredTxs.flat() as PayloadWithWeight[];
      canClaim.value = batchTxs.length > 0;
      amountOfEras.value = batchTxs.length;

      const dappStakingService = container.get<IDappStakingService>(Symbols.DappStakingService);
      canClaimWithoutError.value = await dappStakingService.canClaimRewardWithoutErrors(
        senderAddress.value
      );
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
    let totalWeight: BN = new BN('0');
    for (let i = 0; i < batchTxsRef.length; i++) {
      const tx = batchTxsRef[i];
      const weight = tx.isWeightV2 ? tx.asWeightV2().refTime.toBn() : tx.asWeightV1();
      if (totalWeight.add(weight).gt(MAX_BATCH_WEIGHT)) {
        break;
      }

      txsToExecute.push(tx.payload as ExtrinsicPayload);
      totalWeight = totalWeight.add(weight);
    }

    console.info(
      `Batch weight: ${totalWeight.toString()}, transactions no. ${txsToExecute.length}`
    );
    const transaction = api.tx.utility.batch(txsToExecute);
    const finalizedCallback = (result: ISubmittableResult): void => {
      displayCustomMessage({
        txType: TxType.dappsStaking,
        result,
        senderAddress: senderAddress.value,
        store,
        t,
      });
    };

    try {
      const dappStakingService = container.get<IDappStakingService>(Symbols.DappStakingService);
      await dappStakingService.sendTx({
        senderAddress: senderAddress.value,
        transaction,
        finalizedCallback,
      });
    } catch (error: any) {
      console.error(error.message);
    }
  };

  return {
    claimAll,
    canClaim,
    canClaimWithoutError,
    isLoading,
    amountOfEras,
  };
}
