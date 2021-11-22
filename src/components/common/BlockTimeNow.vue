<template>
  <div>
    <div :class="[isDelayed ? 'tw-text-red-600' : '']">{{ blockTimeSec }} s</div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useApi } from 'src/hooks';
import { useStore } from 'src/store';
import { bnToBn } from '@polkadot/util';

export default defineComponent({
  setup() {
    const store = useStore();
    const { api } = useApi();

    const blockTime = computed(() => store.getters['general/blockTime']);

    const timestamp = ref();
    const blockTimeSec = ref<number>();
    const isDelayed = ref(false);

    const formatValue = (value: number) => {
      const [pre, post] = value.toFixed(1).split('.');
      const before = parseInt(pre) - 10;

      return before;
    };

    const TICK_TIMEOUT = 1000;
    const tick = async () => {
      timestamp.value = await api?.value?.query.timestamp?.now();
      const tsValue =
        timestamp.value && (timestamp.value as Date).getTime
          ? (timestamp.value as Date).getTime()
          : bnToBn(timestamp.value as number).toNumber();

      if (tsValue) {
        const now = Date.now();
        const elapsed = Math.max(Math.abs(now - tsValue), 0) / 1000;
        const value = formatValue(elapsed);
        blockTimeSec.value = value;
        if (value > blockTime.value / 1000) {
          isDelayed.value = true;
        } else {
          isDelayed.value = false;
        }
      }

      setTimeout(tick, TICK_TIMEOUT);
    };

    tick();

    return {
      blockTimeSec,
      isDelayed,
    };
  },
});
</script>
<style scoped>

</style>
