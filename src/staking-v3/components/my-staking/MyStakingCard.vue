<template>
  <div class="card">
    <div class="card--title">
      <div>
        <span>
          {{ caption }}
        </span>
      </div>
      <div
        v-if="isToolTip"
        v-click-away="setIsMobileDisplayTooltip"
        @click="setIsMobileDisplayTooltip"
      >
        <astar-icon-help />
        <q-tooltip
          v-model="isDisplayTooltip"
          anchor="top middle"
          :self="`bottom ${$q.platform.is.mobile ? 'end' : 'middle'}`"
          class="box--tooltip"
        >
          <span class="text--tooltip">{{ textToolTip }}</span>
        </q-tooltip>
      </div>
    </div>

    <div v-if="eras" class="card--days">
      <span>
        {{ $t(`stakingV3.${eras > 1 ? 'days' : 'day'}`, { day: eras }) }}
      </span>
    </div>
    <div v-if="isTextBonusEligible && amount.toString() > '0'" class="card--balance">
      <div class="card--amount">
        <span>{{ $t('stakingV3.bonusEligible') }}</span>
      </div>
    </div>
    <div v-else class="card--balance">
      <div class="card--amount">
        {{ $n(truncate(ethers.utils.formatEther(amount.toString()) ?? '0', 2)) }}
      </div>
      <div class="card--symbol">{{ nativeTokenSymbol }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { ethers } from 'ethers';
import { useNetworkInfo, useTooltip } from 'src/hooks';
import { truncate } from '@astar-network/astar-sdk-core';

export default defineComponent({
  props: {
    caption: {
      type: String,
      required: true,
    },
    amount: {
      type: BigInt as unknown as PropType<BigInt>,
      required: true,
    },
    eras: {
      type: Number,
      required: false,
      default: 0,
    },
    isTextBonusEligible: {
      type: Boolean,
      required: false,
      default: false,
    },
    isToolTip: {
      type: Boolean,
      required: true,
      default: false,
    },
    textToolTip: {
      type: String,
      required: false,
      default: '',
    },
  },
  setup() {
    const { nativeTokenSymbol } = useNetworkInfo();
    const { isDisplayTooltip, setIsMobileDisplayTooltip } = useTooltip('icon');

    return {
      nativeTokenSymbol,
      ethers,
      truncate,
      isDisplayTooltip,
      setIsMobileDisplayTooltip,
    };
  },
});
</script>

<style lang="scss" scoped>
.card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  z-index: 1;
  position: relative;
}

.card--title {
  font-size: 14px;
  font-weight: 700;
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  column-gap: 8px;
}

.card--balance {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.card--amount {
  font-size: 16px;
  font-weight: 700;
}

.card--symbol {
  font-size: 14px;
  font-weight: 600;
}
</style>
