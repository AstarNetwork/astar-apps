<template>
  <div
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
    <div v-for="(chunk, index) in unlockingChunks" :key="index" class="tw-grid tw-grid-cols-12">
      <div class="tw-col-span-1">{{ index + 1 }}.</div>
      <div class="tw-col-span-9 tw-text-right">{{ chunk.amount.toHuman() }}</div>
      <div class="tw-col-span-2 tw-text-right">{{ chunk.erasBeforeUnlock }}</div>
    </div>
    <Button v-if="canUnstake" :primary="false" class="tw-mt-2 tw-float-right">
      {{ $t('store.unstake') }}
    </Button>
  </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted, computed, ref } from 'vue';
import BN from 'bn.js';
import { useApi } from 'src/hooks';
import { useStore } from 'src/store';
import { u32 } from '@polkadot/types';
import { VoidFn } from '@polkadot/api/types';
import { Balance, EraIndex } from '@polkadot/types/interfaces';
import { Codec } from '@polkadot/types/types';
import Button from 'src/components/common/Button.vue';

export default defineComponent({
  components: {
    Button,
  },
  setup() {
    const { api } = useApi();
    const store = useStore();
    const unbondingPeriod = computed(() => store.getters['dapps/getUnbondingPeriod']);
    const selectedAccountAddress = computed(() => store.getters['general/selectedAccountAddress']);
    const unlockingChunks = ref<ChunkInfo[]>();
    const canUnstake = ref<boolean>(false);

    const subscribeToEraChange = async (): Promise<VoidFn | undefined> => {
      const unsub = (await api?.value?.query.dappsStaking.currentEra(async (era: u32) => {
        console.log('new era', era.toNumber(), selectedAccountAddress.value);
        const unbondingInfo =
          await api?.value?.query.dappsStaking.unbondingInfoStorage<UnbondingInfo>(
            selectedAccountAddress.value
          );

        if (unbondingInfo) {
          unlockingChunks.value = unbondingInfo.unlockingChunks;
          store.commit('dapps/setUnlockingChunks', unlockingChunks.value?.length);
          for (const chunk of unlockingChunks.value) {
            const erasBeforeUnlock = new BN(era).sub(chunk.unlockEra).toNumber();
            chunk.erasBeforeUnlock =
              erasBeforeUnlock > unbondingPeriod.value ? 0 : erasBeforeUnlock;

            if (!canUnstake.value) {
              canUnstake.value = chunk.erasBeforeUnlock === 0;
            }
          }
        }
      })) as VoidFn | undefined;

      return unsub;
    };

    const unsub = subscribeToEraChange();

    onUnmounted(async () => {
      const unsubFn = await unsub;
      if (unsubFn) {
        unsubFn();
      }
    });

    return {
      unlockingChunks,
      canUnstake,
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
