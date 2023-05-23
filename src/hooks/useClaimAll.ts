import {
  getIndividualClaimTxs,
  PayloadWithWeight,
  ExtrinsicPayload,
} from '@astar-network/astar-sdk-core';
import { ISubmittableResult } from '@polkadot/types/types';
import { BN } from '@polkadot/util';
import { $api } from 'boot/api';
import { useCurrentEra, useBalance } from 'src/hooks';
import { displayCustomMessage, TxType } from 'src/hooks/custom-signature/message';
import { useStore } from 'src/store';
import { useLedger } from 'src/hooks';
import { container } from 'src/v2/common';
import { DappCombinedInfo } from 'src/v2/models/DappsStaking';
import { IDappStakingService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { ethers } from 'ethers';
import { computed, ref, watchEffect, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const MAX_BATCH_WEIGHT = new BN('50000000000'); // Memo: ≒56 eras
const MAX_BATCH_WEIGHT_LEDGER = new BN('6000000000'); //Memo: 6 eras
const MAX_BATCH_WEIGHT_LEDGER_S = new BN('2000000000'); //Memo:2 eras

export function useClaimAll() {
  let batchTxs: PayloadWithWeight[] = [];
  const amountOfEras = ref<number>(0);
  const canClaim = ref<boolean>(false);
  const canClaimWithoutError = ref<boolean>(true);
  const isLoading = ref<boolean>(false);
  const store = useStore();
  const senderAddress = computed(() => store.getters['general/selectedAddress']);
  const dapps = computed<DappCombinedInfo[]>(() => store.getters['dapps/getAllDapps']);
  const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
  const isSendingTx = computed(() => store.getters['general/isLoading']);
  const isLedger = computed<boolean>(() => store.getters['general/isLedger']);
  const { t } = useI18n();
  const { era } = useCurrentEra();
  const { accountData } = useBalance(senderAddress);
  const { isLedgerNanoS } = useLedger();

  const maxBatchWeight = computed<BN>(() => {
    if (isLedger.value) {
      return isLedgerNanoS.value ? MAX_BATCH_WEIGHT_LEDGER_S : MAX_BATCH_WEIGHT_LEDGER;
    } else {
      return MAX_BATCH_WEIGHT;
    }
  });

  const transferableBalance = computed(() => {
    const balance = accountData.value
      ? ethers.utils.formatEther(accountData.value.getUsableTransactionBalance().toString())
      : '0';
    return Number(balance);
  });

  const updateClaimEras = async (): Promise<void> => {
    try {
      console.log('1');
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
      console.log('2');
      isLoading.value = false;
    }
  };

  watch([isSendingTx, senderAddress], updateClaimEras);

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
      if (totalWeight.add(weight).gt(maxBatchWeight.value)) {
        break;
      }

      txsToExecute.push(tx.payload as ExtrinsicPayload);
      totalWeight = totalWeight.add(weight);
    }

    console.info(
      `Batch weight: ${totalWeight.toString()}, transactions no. ${txsToExecute.length}`
    );
    const transaction = api.tx.utility.batch(txsToExecute);
    const info = await api.tx.utility.batch(txsToExecute).paymentInfo(senderAddress.value);
    const partialFee = info.partialFee.toBn();
    const balance = new BN(
      ethers.utils.parseEther(transferableBalance.value.toString()).toString()
    );

    if (balance.sub(partialFee.muln(1.5)).isNeg()) {
      store.dispatch('general/showAlertMsg', {
        msg: t('dappStaking.error.invalidBalance'),
        alertType: 'error',
      });
      return;
    }

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
