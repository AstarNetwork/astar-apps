<template>
  <button
    v-if="isApprovalNeeded"
    :disabled="selectedNetwork !== srcChainId"
    class="bridge-button"
    :class="isDarkTheme && 'bridge-button-dark'"
    @click="handleApprove"
  >
    {{ $t('bridge.approve') }}
  </button>
  <button
    v-else
    :disabled="isDisabledBridge"
    class="bridge-button"
    :class="isDarkTheme && 'bridge-button-dark'"
    @click="bridge"
  >
    {{ $t('bridge.bridge') }}
  </button>
</template>

<script lang="ts">
import { useStore } from 'src/store';
import { defineComponent, computed } from 'vue';

export default defineComponent({
  props: {
    bridge: {
      type: Function,
      required: true,
    },
    handleApprove: {
      type: Function,
      required: true,
    },
    isDisabledBridge: {
      type: Boolean,
      required: true,
    },
    isApprovalNeeded: {
      type: Boolean,
      required: true,
    },
    selectedNetwork: {
      type: Number,
      required: true,
    },
    srcChainId: {
      type: Number,
      required: true,
    },
  },
  setup() {
    const store = useStore();
    const isDarkTheme = computed(() => store.getters['general/theme'] === 'DARK');
    const isH160 = computed(() => store.getters['general/isH160Formatted']);
    return { isDarkTheme, isH160 };
  },
});
</script>

<style lang="scss" scoped>
@import './styles/xcm-bridge';
</style>
