<template>
  <button
    type="button"
    :disabled="isBusy || isComplete"
    :class="width >= screenSize.sm ? 'btn--update' : 'm-btn--update'"
    @click="updateMetadata"
  >
    <icon-base class="tw-w-5 tw-h-5 tw--ml-1 tw-mr-1" stroke="currentColor" icon-name="network">
      <icon-network />
    </icon-base>
    <template v-if="width >= screenSize.sm">
      {{ $t('common.updateMetadata') }}
    </template>
  </button>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { useStore } from 'src/store';
import { useBreakpoints } from 'src/hooks';
import IconBase from 'components/icons/IconBase.vue';
import IconNetwork from 'components/icons/IconNetwork.vue';

export default defineComponent({
  components: {
    IconBase,
    IconNetwork,
  },
  emits: ['updated-meta'],
  setup(props, { emit }) {
    const store = useStore();
    const { width, screenSize } = useBreakpoints();

    const chainInfo = computed(() => store.getters['general/chainInfo']);
    const metaExtensions = computed(() => store.getters['general/metaExtensions']);
    const extensionCount = computed(() => store.getters['general/extensionCount']);

    const isBusy = ref<boolean>(false);
    const isComplete = ref<boolean>(false);
    const updateMetadata = () => {
      const extensions = metaExtensions?.value?.extensions;
      extensions.forEach((extension: any) => {
        if (chainInfo.value && extension) {
          isBusy.value = true;
          isComplete.value = false;
          extension
            .update(JSON.parse(JSON.stringify(chainInfo.value)))
            .then(() => {
              isBusy.value = false;
              isComplete.value = true;
              emit('updated-meta');
            })
            .catch(console.error);
        }
      });
    };
    return {
      width,
      screenSize,
      extensionCount,
      updateMetadata,
      isBusy,
      isComplete,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.btn--update {
  display: flex;
  height: 32px;
  color: #fff;
  flex-direction: row;
  align-items: center;
  padding: 8px 16px 8px 16px;
  background: $warning-red;
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.25);
  border-radius: 16px;
  margin-left: 16px;
}
.btn--update:hover {
  background: linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), #ff5621;
}
.btn--update:disabled {
  background: #d3d6dc;
}
.m-btn--update {
  padding-left: 10px;
  width: 32px;
  height: 32px;
  background: $gray-5;
  color: $warning-red;
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.25);
  border-radius: 16px;
  margin-left: 16px;
}
.m-btn--update:hover {
  background: linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), #ff5621;
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.25);
  color: #fff;
}
.m-btn--update:disabled {
  background: #d3d6dc;
}
</style>
