<template>
  <div>
    <div>
      <b>{{ dapp.dapp?.name }}</b> {{ dapp.contract.address }}
    </div>
    <div>
      {{ dapp.stakerInfo.totalStakeFormatted }} {{ dapp.stakerInfo.stakersCount }}
      <b>{{ dapp.contract.state }}</b>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, toRefs } from 'vue';
import { DappCombinedInfo } from 'src/v2/models/DappsStaking';

export default defineComponent({
  props: {
    dapp: {
      type: Object as PropType<DappCombinedInfo>,
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
