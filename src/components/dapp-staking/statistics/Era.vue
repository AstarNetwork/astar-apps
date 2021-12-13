<template>
  <div
    class="
      tw-bg-white
      dark:tw-bg-darkGray-800
      tw-mb-8 tw-w-72 tw-rounded-lg tw-text-white
      dark:tw-text-darkGray-100
      tw-py-4 tw-pb-2 tw-px-4
      box
      xl:tw-mx-2
    "
  >
    <div class="tw-text-xl tw-font-semibold tw-mb-2">{{ $t('dappStaking.currentEra') }}</div>
    <div class="tw-flex tw-flex-col tw-items-center tw-mb-1">
      <div class="tw-font-bold tw-text-2xl">
        <vue3-autocounter ref="counter-era" :duration="2" :end-amount="era" :autoinit="era > 0" />
      </div>
    </div>
    <div>
      <div class="tw-font-semibold tw-mb-1">
        {{ $t('dappStaking.blocksUntilNextEra') }}
      </div>
      <div class="tw-relative">
        <VueJsProgress
          :percentage="Number(progress)"
          bg="turquoise"
          :delay="600"
          :striped="true"
          :animation="true"
        />
        <div class="tw-absolute tw-bottom-0 tw-w-full tw-text-white tw-font-semibold">
          <div class="tw-flex tw-justify-center">
            <vue3-autocounter
              ref="counter-countdown"
              :start-amount="startValue"
              :end-amount="blocksUntilNextEra"
              separator=","
              decimal-separator="."
              :duration="2"
              :autoinit="blocksUntilNextEra > 0"
              @finished="startValue = blocksUntilNextEra"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import VueJsProgress from 'vue-js-progress';
import Vue3autocounter from 'vue3-autocounter';
import './era.scss';

export default defineComponent({
  components: {
    VueJsProgress,
    'vue3-autocounter': Vue3autocounter,
  },
  props: {
    progress: {
      type: Number,
      required: true,
      default: 0,
    },
    era: {
      type: Number,
      required: true,
      default: 0,
    },
    blocksUntilNextEra: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  setup() {
    const startValue = ref<number>(0);
    return { startValue };
  },
});
</script>

<style scoped>
.box {
  background: linear-gradient(83.83deg, #694ea4, #1b6dc1 37.5%, #1b6dc1 65.1%, #2ea0c4);
  box-shadow: 0 2px 2px rgb(0 0 0 / 30%);
}
</style>
