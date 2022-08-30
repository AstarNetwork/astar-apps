<template>
  <div>
    <div>{{ dapp.name }} {{ dapp.address }}</div>
    <div>{{ stakerInfo.totalStakeFormatted }} {{ stakerInfo.stakersCount }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, toRefs } from 'vue';
import { DappItem } from 'src/store/dapp-staking/state';
import { StakerInfo } from 'src/v2/models/DappsStaking';

export default defineComponent({
  props: {
    dapp: {
      type: Object as PropType<DappItem>,
      required: true,
    },
    stakerInfo: {
      type: StakerInfo,
      required: true,
    },
  },
  setup(props) {
    return {
      ...toRefs(props),
    };
  },
});
</script>
