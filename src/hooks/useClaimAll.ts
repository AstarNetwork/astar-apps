import { getIndividualClaimTxs, PayloadWithWeight } from '@astar-network/astar-sdk-core';
import { ISubmittableResult } from '@polkadot/types/types';
import { BN } from '@polkadot/util';
import { $api } from 'boot/api';
import { useCurrentEra, useBalance, useAccount } from 'src/hooks';
import { displayCustomMessage, TxType } from 'src/hooks/custom-signature/message';
import { useStore } from 'src/store';
import { useLedger } from 'src/hooks';
import { container } from 'src/v2/common';
import { DappCombinedInfo } from 'src/v2/models/DappsStaking';
import { IDappStakingService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { ethers } from 'ethers';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useDappStaking } from 'src/staking-v3';

const MAX_BATCH_WEIGHT = new BN('50000000000'); // Memo: ≒56 eras
const MAX_BATCH_WEIGHT_LEDGER = new BN('6000000000'); //Memo: 6 eras
const MAX_BATCH_WEIGHT_LEDGER_S = new BN('2000000000'); //Memo: 2 eras

export function useClaimAll() {
  let batchTxs: PayloadWithWeight[] = [];
  const amountOfEras = ref<number>(0);
  const canClaim = ref<boolean>(false);
  const canClaimWithoutError = ref<boolean>(true);
  const isLoading = ref<boolean>(false);
  const store = useStore();
  const { senderSs58Account, currentAccount } = useAccount();
  const dapps = computed<DappCombinedInfo[]>(() => store.getters['dapps/getAllDapps']);
  const isSendingTx = computed(() => store.getters['general/isLoading']);
  const isLedger = computed<boolean>(() => store.getters['general/isLedger']);
  const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
  const { t } = useI18n();
  const { era } = useCurrentEra();
  const { accountData } = useBalance(senderSs58Account);
  const { isLedgerNanoS } = useLedger();
  const { isDappStakingV3 } = useDappStaking();

  const maxBatchWeight = computed<BN>(() => {
    if (isLedger.value) {
      return isLedgerNanoS.value ? MAX_BATCH_WEIGHT_LEDGER_S : MAX_BATCH_WEIGHT_LEDGER;
    } else {
      return MAX_BATCH_WEIGHT;
    }
  });

  const transferableBalance = computed<number>(() => {
    const balance = accountData.value
      ? ethers.utils.formatEther(accountData.value.getUsableTransactionBalance().toString())
      : '0';
    return Number(balance);
  });

  const isDappDeveloper = computed<boolean>(() => {
    return (
      dapps.value &&
      dapps.value.some((it) => it.contract.developerAddress === senderSs58Account.value)
    );
  });

  const updateClaimEras = async (): Promise<void> => {
    try {
      if (isDappStakingV3.value) {
        return;
      }

      isLoading.value = true;
      const api = $api;
      const senderAddressRef = senderSs58Account.value;
      if (!api) {
        throw Error('Failed to connect to API');
      }
      if (!senderAddressRef || !era.value || isSendingTx.value) {
        return;
      }
      const txs = await Promise.all(
        dapps.value.map(async (it) => {
          try {
            const dappAddress = it.dapp ? it.dapp.address : it.contract.address;
            if (dappAddress) {
              const transactions = await getIndividualClaimTxs({
                dappAddress,
                api,
                senderAddress: senderAddressRef,
                currentEra: era.value,
              });
              return transactions.length ? transactions : null;
            } else {
              return null;
            }
          } catch (error) {
            console.error(error);
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
        senderSs58Account.value
      );
    } catch (error: any) {
      console.error(error.message);
    } finally {
      isLoading.value = false;
    }
  };

  watch([isSendingTx, senderSs58Account, era, dapps], updateClaimEras);

  const claimAll = async (): Promise<void> => {
    const dappStakingServiceFactory = container.get<() => IDappStakingService>(
      Symbols.DappStakingServiceFactory
    );
    const dappStakingService = dappStakingServiceFactory();

    const finalizedCallback = (result: ISubmittableResult): void => {
      displayCustomMessage({
        txType: TxType.dappsStaking,
        result,
        senderAddress: senderSs58Account.value,
        store,
        t,
      });
    };

    try {
      await dappStakingService.claimAll({
        senderAddress: senderSs58Account.value,
        finalizedCallback,
        batchTxs,
        maxBatchWeight: maxBatchWeight.value,
        transferableBalance: transferableBalance.value,
        invalidBalanceMsg: t('dappStaking.error.invalidBalance'),
        h160SenderAddress: isH160.value ? currentAccount.value : '',
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
    isDappDeveloper,
  };
}
