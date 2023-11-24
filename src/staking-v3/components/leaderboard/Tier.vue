<template>
  <div class="wrapper--tier">
    <div class="title">{{ $t('stakingV3.tier') }} {{ tier }}</div>
    <div v-for="(dapp, index) in slicedDapps" :key="dapp.chain.id">
      <div class="dapp">
        <div>{{ index + 1 }}</div>
        <div><img :src="dapp.basic.iconUrl" :alt="dapp.basic.name" class="dapp--image" /></div>
        <div>{{ dapp.basic.name }}</div>
        <div class="amount"><format-balance :balance="dapp.chain.totalStake ?? 0" /></div>
      </div>
    </div>
    <div v-for="index in itemsToShow - slicedDapps.length" :key="index">
      <div class="dapp">
        <div>{{ index + slicedDapps.length }}</div>
        <div><img :src="require('../../assets/burn.png')" alt="Burn" class="dapp--image" /></div>
        <div>No Entry</div>
        <div class="amount">Burn</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';
import { CombinedDappInfo } from '../../logic';
import FormatBalance from 'src/components/common/FormatBalance.vue';

export default defineComponent({
  components: {
    FormatBalance,
  },
  props: {
    tier: {
      type: Number,
      required: true,
    },
    dapps: {
      type: Object as PropType<CombinedDappInfo[]>,
      required: true,
    },
  },
  setup(props) {
    const itemsToShow = 5;
    const slicedDapps = computed<CombinedDappInfo[]>(() => props.dapps.slice(0, itemsToShow));

    return { slicedDapps, itemsToShow };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/css/quasar.variables.scss';
.wrapper--tier {
  background-color: $gray-1;
  border-radius: 16px;
  padding: 16px;
}
.title {
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  padding: 16px 0;
  margin-bottom: 16px;
}

.dapp {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 16px 0;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}

.dapp--image {
  width: 24px;
  height: 24px;
  border-radius: 6px;
}

.amount {
  text-align: right;
  width: 120px;
}
</style>
