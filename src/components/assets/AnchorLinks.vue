<template>
  <div class="wrapper--anchor-links">
    <div class="item" @click="scrollTo(nativeSection)">{{ nativeTokenSymbol }}</div>
    <div class="item" :class="isStakerRewards && 'bg--notify'" @click="scrollTo(stakingSection)">
      <span>
        {{ $t('common.staking') }}
      </span>
      <div v-if="isStakerRewards">
        <div class="dot--bg" />
        <div class="dot--active" />
      </div>
    </div>
    <div
      v-if="isDappOwner"
      class="item"
      :class="hasDappRewards && 'bg--notify'"
      @click="scrollTo(projectSection)"
    >
      <span>
        {{ $t('assets.project') }}
      </span>
      <div v-if="hasDappRewards">
        <div class="dot--bg" />
        <div class="dot--active" />
      </div>
    </div>
    <div class="item" @click="scrollTo(assetsSection)">{{ $t('assets.assets') }}</div>
  </div>
</template>
<script lang="ts">
import { useNetworkInfo } from 'src/hooks';
import { useDappStaking } from 'src/staking-v3';
import { computed, defineComponent } from 'vue';

export default defineComponent({
  components: {},
  props: {
    nativeSection: {
      type: HTMLElement,
      required: true,
    },
    stakingSection: {
      type: HTMLElement,
      required: true,
    },
    projectSection: {
      type: HTMLElement,
      required: true,
    },
    assetsSection: {
      type: HTMLElement,
      required: true,
    },
    isDappOwner: {
      type: Boolean,
      required: true,
    },
  },
  setup() {
    const { nativeTokenSymbol } = useNetworkInfo();

    const scrollTo = (section: any) => {
      section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const { hasBonusRewards, hasStakerRewards, hasDappRewards } = useDappStaking();

    const isStakerRewards = computed<boolean>(() => {
      return hasStakerRewards.value || hasBonusRewards.value;
    });

    return { nativeTokenSymbol, scrollTo, isStakerRewards, hasDappRewards };
  },
});
</script>
<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';
.wrapper--anchor-links {
  background-color: $gray-1;
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

.bg--notify {
  background-color: $gray-0;
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
  position: relative;
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

.dot--bg {
  top: -6px;
  right: -5px;
  position: absolute;
  width: 22px;
  height: 22px;
  background-color: $gray-1;
  border-radius: 100%;
}

.dot--active {
  top: 0;
  right: 0;
  position: absolute;
  width: 12px;
  height: 12px;
  background-color: $astar-pink-1;
  border-radius: 100%;
}

.body--dark {
  .wrapper--anchor-links {
    background-color: $navy-1;
    border-color: $navy-3;
    box-shadow: 0px 3px 8px 0px rgba(0, 0, 0, 0.8);
  }
  .item {
    color: $gray-2;
  }
  .bg--notify {
    background-color: $navy-3;
  }

  .dot--bg {
    background-color: $navy-1;
  }
}
</style>
