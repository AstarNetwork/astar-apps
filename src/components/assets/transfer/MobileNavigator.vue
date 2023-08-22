<template>
  <div class="wrapper--mobile-navigator">
    <div class="container--mobile-navigator">
      <button class="circle--button" @click="scrollTo('faq')">
        <astar-icon-group :size="size" />
        <span>{{ $t('assets.transferPage.faq') }}</span>
      </button>
      <button v-if="!isMultisig" class="circle--button" @click="scrollTo('history')">
        <astar-icon-history :size="size" />
        <span>{{ $t('assets.transferPage.recentHistory') }}</span>
      </button>
      <button class="circle--button" @click="scrollTo('hot-topics')">
        <astar-icon-group :size="size" />
        <span>{{ $t('assets.transferPage.hotTopic') }}</span>
      </button>
    </div>
  </div>
</template>
<script lang="ts">
import { useAccount, useBreakpoints } from 'src/hooks';
import { defineComponent, computed } from 'vue';

export default defineComponent({
  setup() {
    const { screenSize, width } = useBreakpoints();
    const size = computed(() => (width.value > screenSize.sm ? '24' : '21'));
    const { isMultisig } = useAccount();
    const scrollTo = (id: string): void => {
      const el = document.getElementById(id);
      el && el.scrollIntoView({ behavior: 'smooth' });
    };

    return {
      screenSize,
      size,
      isMultisig,
      scrollTo,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/mobile-navigator.scss';
</style>
