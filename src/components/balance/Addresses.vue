<template>
  <div
    class="
      tw-relative tw-rounded-lg tw-z-0 tw-flex tw-flex-col tw-shadow tw-bg-white
      dark:tw-bg-darkGray-800
      tw-px-1
      sm:tw-px-2
      tw-py-4 tw-gap-y-2
    "
  >
    <Address />
    <div
      class="
        tw-border tw-border-gray-300
        dark:tw-border-white
        tw-rounded-md tw-p-2 tw-m-3 tw-mb-2 tw-text-blue-900
        dark:tw-text-darkGray-100
      "
    >
      <p class="tw-font-bold">{{ $t('balance.transferFromMetamask', { token: tokenSymbol }) }}</p>
      <p>{{ $t('balance.howToSendFromMetamask', { token: tokenSymbol }) }}</p>
      <a
        class="tw-underline"
        target="_blank"
        rel="noopener noreferrer"
        :href="docsUrl.evmDeposit"
        >{{ $t('balance.readTheTutorial') }}</a
      >
    </div>
  </div>
</template>
<script lang="ts">
import { useStore } from 'src/store';
import { computed, defineComponent } from 'vue';
import Address from './Address.vue';
import { docsUrl } from 'src/links';

export default defineComponent({
  components: {
    Address,
  },
  setup() {
    const store = useStore();
    const tokenSymbol = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      return chainInfo && chainInfo.tokenSymbol;
    });
    return { tokenSymbol, docsUrl };
  },
});
</script>
