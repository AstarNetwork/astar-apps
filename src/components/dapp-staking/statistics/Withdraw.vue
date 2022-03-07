<template>
  <div
    v-if="canUnbondWithdraw"
    class="
      tw-bg-white
      dark:tw-bg-darkGray-800
      tw-mb-8 tw-w-72 tw-rounded-lg tw-text-white
      dark:tw-text-darkGray-100
      xl:tw-mx-2
      tw-py-4 tw-pb-8 tw-px-4
      box
    "
  >
    <div class="tw-text-xl tw-font-semibold tw-mb-4 tw-uppercase">
      {{ $t('dappStaking.unbondedFunds') }}
    </div>
    <div class="tw-flex tw-flex-col tw-items-center">
      <FormatBalance :balance="totalToWithdraw" class="tw-flex tw-text-2xl tw-font-bold" />
    </div>
    <div class="tw-flex tw-flex-row tw-items-baseline tw-float-right">
      <div class="tw-cursor-pointer tw-mr-4" @click="showModal = true">
        {{ $t('dappStaking.chunks') }} ({{ unlockingChunks?.length }})
      </div>
      <Button v-if="canWithdraw" :primary="false" class="tw-mt-4" @click="withdraw()">
        {{ $t('dappStaking.withdraw') }}
      </Button>
    </div>

    <ChunksModal
      v-if="showModal"
      v-model:isOpen="showModal"
      :unlocking-chunks="unlockingChunks"
      :max-unlocking-chunks="maxUnlockingChunks"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted, computed, ref, watch } from 'vue';
import BN from 'bn.js';
import { $api } from 'boot/api';
import { useStore } from 'src/store';
import { u32 } from '@polkadot/types';
import { VoidFn } from '@polkadot/api/types';
import { Balance, EraIndex } from '@polkadot/types/interfaces';
import { Codec } from '@polkadot/types/types';
import { useAccount, useStakingH160 } from 'src/hooks';
import Button from 'src/components/common/Button.vue';
import { WithdrawParameters } from 'src/store/dapp-staking/actions';
import FormatBalance from 'components/balance/FormatBalance.vue';
import ChunksModal from './ChunksModal.vue';
import { useUnbondWithdraw } from 'src/hooks/useUnbondWithdraw';
import { endpointKey } from 'src/config/chainEndpoints';

export default defineComponent({
  components: {
    Button,
    FormatBalance,
    ChunksModal,
  },
  setup() {
    const store = useStore();
    const selectedAccountAddress = computed(() => store.getters['general/selectedAddress']);
    const unlockingChunksCount = computed(() => store.getters['dapps/getUnlockingChunks']);
    const maxUnlockingChunks = computed(() => store.getters['dapps/getMaxUnlockingChunks']);
    const unlockingChunks = ref<ChunkInfo[]>();
    const canWithdraw = ref<boolean>(false);
    const totalToWithdraw = ref<BN>(new BN(0));
    const showModal = ref<boolean>(false);
    const { canUnbondWithdraw } = useUnbondWithdraw();
    const isH160 = computed(() => store.getters['general/isH160Formatted']);
    const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);
    const { currentAccount } = useAccount();
    const { callWithdrawUnbonded } = useStakingH160(currentAccount);
    const currentNetworkIdx = computed(() => store.getters['general/networkIdx']);

    const withdraw = async (): Promise<void> => {
      if (!isH160.value) {
        const result = await store.dispatch('dapps/withdrawUnbonded', {
          api: $api?.value,
          senderAddress: selectedAccountAddress.value,
          substrateAccounts: substrateAccounts.value,
        } as WithdrawParameters);
      } else {
        if (currentNetworkIdx.value === endpointKey.SHIBUYA) {
          await callWithdrawUnbonded();
        }
      }
    };

    const subscribeToEraChange = async (): Promise<VoidFn | undefined> => {
      const unsub = (await $api?.value?.query.dappsStaking.currentEra(async (era: u32) => {
        await getChunks(era);
      })) as VoidFn | undefined;

      return unsub;
    };

    const unsub = subscribeToEraChange();

    const getChunks = async (era: u32) => {
      if (!canUnbondWithdraw.value) {
        return;
      }

      const ledger = await $api?.value?.query.dappsStaking.ledger<PalletDappsStakingAccountLedger>(
        selectedAccountAddress.value
      );

      if (ledger?.unbondingInfo.unlockingChunks) {
        unlockingChunks.value = ledger.unbondingInfo.unlockingChunks;
        store.commit('dapps/setUnlockingChunks', unlockingChunks.value?.length);
        canWithdraw.value = false;
        totalToWithdraw.value = new BN(0);
        for (const chunk of unlockingChunks.value) {
          const erasBeforeUnlock = era.sub(chunk.unlockEra.toBn()).toNumber();
          chunk.erasBeforeUnlock = Math.abs(erasBeforeUnlock > 0 ? 0 : erasBeforeUnlock);

          if (erasBeforeUnlock >= 0) {
            totalToWithdraw.value = totalToWithdraw.value.add(chunk.amount.toBn());
          }

          if (!canWithdraw.value) {
            canWithdraw.value = chunk.erasBeforeUnlock === 0;
          }
        }
      }
    };

    watch(
      () => unlockingChunksCount.value,
      async (chunks) => {
        console.log('chunks count changed');
        const era = await $api?.value?.query.dappsStaking.currentEra<u32>();
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
      showModal,
      maxUnlockingChunks,
      canUnbondWithdraw,
    };
  },
});

interface PalletDappsStakingAccountLedger extends Codec {
  unbondingInfo: UnbondingInfo;
}

interface UnbondingInfo {
  unlockingChunks: ChunkInfo[];
}

export interface ChunkInfo extends Codec {
  amount: Balance;
  unlockEra: EraIndex;
  erasBeforeUnlock: number;
}
</script>

<style scoped>
.box {
  background: linear-gradient(83.83deg, #694ea4, #1b6dc1 37.5%, #1b6dc1 65.1%, #2ea0c4);
  box-shadow: 0 2px 2px rgb(0 0 0 / 30%);
}
</style>
