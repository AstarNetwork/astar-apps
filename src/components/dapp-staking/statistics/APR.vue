<template>
  <div
    v-if="stakerApr > 0"
    class="
      sm:tw-w-40
      tw-justify-center
      tw-inline-flex
      tw-items-center
      tw-px-6
      tw-py-3
      tw-border
      tw-border-transparent
      tw-text-sm
      tw-font-medium
      tw-rounded-full
      tw-shadow-sm
      tw-text-white
      tw-bg-indigo-500
      tw-mx-1
    "
  >
    <icon-base class="tw-w-5 tw-h-5 tw-text-white tw--ml-2 tw-mr-2" icon-name="seedling">
      <q-icon :name="fasSeedling" color="green" />
    </icon-base>
    <div>
      {{ $t('dappStaking.stakerApr', { value: Number(stakerApr.toFixed(1)) }) }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useApr } from 'src/hooks';
import { fasSeedling } from '@quasar/extras/fontawesome-v5';
import IconBase from 'components/icons/IconBase.vue';

export default defineComponent({
  components: {
    IconBase,
  },
  setup() {
    const { stakerApr } = useApr();

    return {
      stakerApr,
      fasSeedling,
    };
  },
});
</script>
