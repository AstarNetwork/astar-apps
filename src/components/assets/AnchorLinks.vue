<template>
  <div class="wrapper--anchor-links">
    <div class="item" @click="scrollTo(nativeSection)">{{ nativeTokenSymbol }}</div>
    <div class="item" @click="scrollTo(stakingSection)">{{ $t('common.staking') }}</div>
    <div class="item" @click="scrollTo(projectSection)">{{ $t('assets.project') }}</div>
    <div class="item" @click="scrollTo(assetsSection)">{{ $t('assets.assets') }}</div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useNetworkInfo } from 'src/hooks';
import { Null } from '@polkadot/types';

export default defineComponent({
  components: {},
  props: {
    nativeSection: {
      type: HTMLElement || Null,
      required: true,
    },
    stakingSection: {
      type: HTMLElement || Null,
      required: true,
    },
    projectSection: {
      type: HTMLElement || Null,
      required: true,
    },
    assetsSection: {
      type: HTMLElement || Null,
      required: true,
    },
  },
  setup() {
    const { nativeTokenSymbol } = useNetworkInfo();

    const scrollTo = (section: any) => {
      section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return { nativeTokenSymbol, scrollTo };
  },
});
</script>
<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';
.wrapper--anchor-links {
  background-color: white;
  top: 80px;
  position: sticky;
  display: flex;
  border-radius: 16px;
  border: 1px solid $gray-2;
  padding: 8px;
  gap: 4px;
  filter: drop-shadow(0px 4px 15px rgba(0, 0, 0, 0.1));
  z-index: 2;
  @media (min-width: $lg) {
    top: 16px;
  }
}

.item {
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: $navy-1;
  font-size: 14px;
  font-weight: 700;
  padding: 16px;
  flex-grow: 1;
  text-align: center;
  @media (min-width: $sm) {
    font-size: 16px;
    padding: 16px 24px;
    flex-grow: inherit;
  }
  &:hover {
    background-color: $astar-blue;
    color: white;
  }
}
</style>
