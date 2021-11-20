<template>
  <div
    class="
      tw-bg-white
      dark:tw-bg-darkGray-800
      tw-mb-8 tw-w-72 tw-rounded-lg tw-text-white
      dark:tw-text-darkGray-100
      tw-py-4 tw-pb-4 tw-px-4
      box
    "
  >
    <div class="tw-text-xl tw-font-semibold tw-mb-2">{{ $t('store.currentEra') }}</div>
    <div class="tw-flex tw-flex-col tw-items-center tw-mb-1">
      <div class="tw-font-bold tw-text-xl">
        {{ era }}
      </div>
    </div>
    <div class="">
      <div class="tw-font-semibold tw-mb-1">
        {{ $t('store.blocksUntilNextEra') }}
      </div>
      <q-linear-progress size="22px" :value="progress" color="secondary" stripe rounded>
        <div class="absolute-full flex flex-center">
          <q-badge
            color="transparent"
            text-color="white"
            :label="blockUntilNextEra.toLocaleString('en-US')"
          />
        </div>
      </q-linear-progress>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useCurrentEra } from 'src/hooks';

export default defineComponent({
  setup() {
    const { era, blockPerEra, blockUntilNextEra, progress } = useCurrentEra();

    return {
      era,
      blockPerEra,
      blockUntilNextEra,
      progress,
    };
  },
});
</script>

<style scoped>
.box {
  background: linear-gradient(83.83deg, #694ea4, #1b6dc1 37.5%, #1b6dc1 65.1%, #2ea0c4);
  box-shadow: 0 2px 2px rgb(0 0 0 / 30%);
}
</style>
