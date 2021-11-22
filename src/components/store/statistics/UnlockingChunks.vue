<template>
  <div
    v-if="unlockingChunks?.length > 0"
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
      {{ $t('store.unlockingChunks') }}
    </div>
    <div class="tw-grid tw-grid-cols-12">
      <div class="tw-col-span-1">{{ $t('store.chunk') }}</div>
      <div class="tw-col-span-8 tw-text-right">{{ $t('store.amount') }}</div>
      <div class="tw-col-span-3 tw-text-right">{{ $t('store.era') }}</div>
    </div>
    <div v-for="(chunk, index) in unlockingChunks" :key="index" class="tw-grid tw-grid-cols-12">
      <div class="tw-col-span-1">{{ index + 1 }}.</div>
      <div class="tw-col-span-8 tw-text-right tw-font-semibold">{{ chunk.amount.toHuman() }}</div>
      <div class="tw-col-span-3 tw-text-right">{{ chunk.erasBeforeUnlock }}</div>
    </div>
    <Button v-if="canWithdraw" :primary="false" class="tw-mt-2 tw-float-right" @click="withdraw()">
      {{ $t('store.withdraw') }}
    </Button>
  </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted, computed, ref, watch } from 'vue';
import BN from 'bn.js';
import { useApi } from 'src/hooks';
import { useStore } from 'src/store';
import { u32 } from '@polkadot/types';
import { VoidFn } from '@polkadot/api/types';
import { Balance, EraIndex } from '@polkadot/types/interfaces';
import { Codec } from '@polkadot/types/types';
import Button from 'src/components/common/Button.vue';
import { WithdrawParameters } from 'src/store/dapps-store/actions';

export default defineComponent({
  components: {
    Button,
  },
  setup() {
    const { api } = useApi();
    const store = useStore();
    const selectedAccountAddress = computed(() => store.getters['general/selectedAccountAddress']);
    const unlockingChunksCount = computed(() => store.getters['dapps/getUnlockingChunks']);
    const unlockingChunks = ref<ChunkInfo[]>();
    const canWithdraw = ref<boolean>(false);

    const withdraw = async (): Promise<void> => {
      const result = await store.dispatch('dapps/withdrawUnbonded', {
        api: api?.value,
        senderAddress: selectedAccountAddress.value,
      } as WithdrawParameters);
    };

    const subscribeToEraChange = async (): Promise<VoidFn | undefined> => {
      const unsub = (await api?.value?.query.dappsStaking.currentEra(async (era: u32) => {
        console.log('new era', era.toNumber(), selectedAccountAddress.value);
        await getChunks(era);
      })) as VoidFn | undefined;

      return unsub;
    };

    const unsub = subscribeToEraChange();

    const getChunks = async (era: u32) => {
      const unbondingInfo =
        await api?.value?.query.dappsStaking.unbondingInfoStorage<UnbondingInfo>(
          selectedAccountAddress.value
        );

      if (unbondingInfo?.unlockingChunks) {
        unlockingChunks.value = unbondingInfo.unlockingChunks;
        store.commit('dapps/setUnlockingChunks', unlockingChunks.value?.length);
        canWithdraw.value = false;
        for (const chunk of unlockingChunks.value) {
          const erasBeforeUnlock = new BN(era).sub(chunk.unlockEra).toNumber();
          chunk.erasBeforeUnlock = erasBeforeUnlock > 0 ? 0 : erasBeforeUnlock;

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
        const era = await api?.value?.query.dappsStaking.currentEra<u32>();
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
    };
  },
});

interface UnbondingInfo extends Codec {
  unlockingChunks: ChunkInfo[];
}

interface ChunkInfo extends Codec {
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
