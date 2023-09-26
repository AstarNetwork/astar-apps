import { VoidFn } from '@polkadot/api/types';
import { u32 } from '@polkadot/types';
import { ISubmittableResult } from '@polkadot/types/types';
import BN from 'bn.js';
import { $api } from 'boot/api';
import { displayCustomMessage, TxType } from 'src/hooks/custom-signature/message';
import { useUnbondWithdraw } from 'src/hooks/useUnbondWithdraw';
import { useStore } from 'src/store';
import { container } from 'src/v2/common';
import { ChunkInfo } from 'src/v2/models';
import { IDappStakingService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { computed, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAccount } from '../useAccount';

const eventWithdrawal = 'SentWithdrawalTransaction';

export function useUnbonding() {
  const store = useStore();
  const { t } = useI18n();
  const { senderSs58Account, currentAccount } = useAccount();
  const unlockingChunksCount = computed(() => store.getters['dapps/getUnlockingChunks']);
  const maxUnlockingChunks = computed(() => store.getters['dapps/getMaxUnlockingChunks']);
  const unbondingPeriod = computed(() => store.getters['dapps/getUnbondingPeriod']);

  const unlockingChunks = ref<ChunkInfo[]>();
  const canWithdraw = ref<boolean>(false);
  const totalToWithdraw = ref<BN>(new BN(0));
  const { canUnbondWithdraw } = useUnbondWithdraw($api);

  const withdraw = async (): Promise<void> => {
    try {
      const finalizedCallback = (result: ISubmittableResult): void => {
        displayCustomMessage({
          txType: TxType.withdrawUnbonded,
          result,
          senderAddress: senderSs58Account.value,
          store,
          t,
        });
      };

      try {
        const dappStakingServiceFactory = container.get<() => IDappStakingService>(
          Symbols.DappStakingServiceFactory
        );
        const dappStakingService = dappStakingServiceFactory();

        await dappStakingService.withdraw({
          senderAddress: currentAccount.value,
          finalizedCallback,
        });
        window.dispatchEvent(new CustomEvent(eventWithdrawal));
      } catch (error: any) {
        console.error(error.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const subscribeToEraChange = async (): Promise<VoidFn | undefined> => {
    const unsub = (await $api?.query.dappsStaking.currentEra(async (era: u32) => {
      await getChunks(era);
    })) as VoidFn | undefined;

    return unsub;
  };

  const unsub = subscribeToEraChange();

  const getChunks = async (era: u32) => {
    if (!canUnbondWithdraw.value || !senderSs58Account.value) {
      return;
    }

    const service = container.get<IDappStakingService>(Symbols.DappStakingService);
    const ledger = await service.getLedger(senderSs58Account.value);

    if (ledger.unbondingInfo.unlockingChunks) {
      unlockingChunks.value = ledger.unbondingInfo.unlockingChunks;
      store.commit('dapps/setUnlockingChunks', unlockingChunks.value?.length);
      canWithdraw.value = false;
      totalToWithdraw.value = new BN(0);
      for (const chunk of ledger.unbondingInfo.unlockingChunks) {
        const erasBeforeUnlock = era.sub(chunk.unlockEra).toNumber();
        chunk.erasBeforeUnlock = Math.abs(erasBeforeUnlock > 0 ? 0 : erasBeforeUnlock);

        if (erasBeforeUnlock >= 0) {
          totalToWithdraw.value = totalToWithdraw.value.add(chunk.amount);
        }

        if (!canWithdraw.value) {
          canWithdraw.value = chunk.erasBeforeUnlock === 0;
        }
      }
    }
  };

  watch(
    () => [unlockingChunksCount.value, senderSs58Account.value],
    async (chunks) => {
      // console.log('chunks count changed');
      const era = await $api?.query.dappsStaking.currentEra<u32>();
      if (era) {
        await getChunks(era);
      }
    }
  );

  onUnmounted(async () => {
    const unsubFn = await unsub;
    if (unsubFn) {
      unsubFn();
    }
  });

  return {
    unlockingChunks,
    canWithdraw,
    withdraw,
    totalToWithdraw,
    maxUnlockingChunks,
    canUnbondWithdraw,
    unlockingChunksCount,
    unbondingPeriod,
    eventWithdrawal,
  };
}
