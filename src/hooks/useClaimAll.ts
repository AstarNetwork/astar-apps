import { useI18n } from 'vue-i18n';
import { useGasPrice, useCurrentEra, useCustomSignature, useNetworkInfo } from 'src/hooks';
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
import { DappCombinedInfo } from 'src/v2/models/DappsStaking';

const MAX_BATCH_WEIGHT = new BN('50000000000');

export function useClaimAll() {
  let batchTxs: PayloadWithWeight[] = [];
  const amountOfEras = ref<number>(0);
  const canClaim = ref<boolean>(false);
  const isLoading = ref<boolean>(true);
  const store = useStore();
  const senderAddress = computed(() => store.getters['general/selectedAddress']);
  const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);
  const dapps = computed<DappCombinedInfo[]>(() => store.getters['dapps/getAllDapps']);
  const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
  const isSendingTx = computed(() => store.getters['general/isLoading']);
  const { nativeTipPrice } = useGasPrice();
  const { currentNetworkName } = useNetworkInfo();
  const { t } = useI18n();

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

  const dispatchGetDapps = (): void => {
    const isDispatch = currentNetworkName.value && dapps.value.length === 0 && senderAddress.value;
    if (isDispatch) {
      store.dispatch('dapps/getDapps', {
        network: currentNetworkName.value.toLowerCase(),
        currentAccount: senderAddress.value,
      });
    }
    if (isH160.value) {
      store.dispatch('general/showAlertMsg', {
        msg: t('dappStaking.error.onlySupportsSubstrate'),
        alertType: 'error',
      });
    }
  };

  watchEffect(dispatchGetDapps);

  return {
    claimAll,
    canClaim,
    isLoading,
    amountOfEras,
  };
}
