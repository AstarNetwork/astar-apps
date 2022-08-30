<template>
  <div>
    <h2>{{ tag }}</h2>
    <dapp-card
      v-for="dapp of dapps"
      :key="dapp.address"
      :dapp="dapp"
      :staker-info="getStakerInfo(dapp.address)"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, toRefs } from 'vue';
import { useStore } from 'src/store';
import { DappItem } from 'src/store/dapp-staking/state';
import { StakerInfo } from 'src/v2/models/DappsStaking';
import DappCard from 'src/v2/components/dapp-staking/DappCard.vue';

export default defineComponent({
  components: {
    DappCard,
  },
  props: {
    tag: {
      type: String,
      default: undefined,
    },
  },
  setup(props) {
    const store = useStore();
    const dapps = computed<DappItem[]>(() => store.getters['dapps/getDapps'](props.tag));
    const stakerInfos = computed<StakerInfo[]>(() => store.getters['dapps/getStakerInfos']);

    const getStakerInfo = (contractAddress: string): StakerInfo =>
      stakerInfos.value.find((x) => x.contractAddress === contractAddress) ??
      StakerInfo.createDefault(contractAddress);

    return {
      ...toRefs(props),
      dapps,
      getStakerInfo,
    };
  },
});
</script>
