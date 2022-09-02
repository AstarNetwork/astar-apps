<template>
  <!-- <div>
    <div>
      <b>{{ dapp.dapp?.name }}</b> {{ dapp.contract.address }}
    </div>
    <div>
      {{ dapp.stakerInfo.totalStakeFormatted }} {{ dapp.stakerInfo.stakersCount }}
      <b>{{ dapp.contract.state }}</b>
    </div>
  </div> -->
  <div class="card-container">
    <div class="dapp-logo">
      <img :src="dapp.dapp?.iconUrl" />
    </div>
    <div>
      <div>{{ dapp.dapp?.name }}</div>
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

<style scoped>
.card-container {
  display: flex;
  flex-direction: row;
  border: 1px solid lightgray;
  border-radius: 4px;
  padding: 8px;
  width: 306px;
}

.dapp-logo {
  box-shadow: 0 4px 12px rgba(0, 34, 51, 0.08), 0 2px 4px rgba(0, 34, 51, 0.16);
}

.dapp-logo img {
  width: 80px;
  height: 80px;
  border-radius: 8px;
}
</style>
