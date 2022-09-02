<template>
  <div>
    <h2>{{ tag }}</h2>
    <div class="list-container">
      <dapp-card v-for="dapp of dapps" :key="dapp.contract.address" :dapp="dapp" />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, toRefs } from 'vue';
import { useStore } from 'src/store';
import { DappCombinedInfo } from 'src/v2/models/DappsStaking';
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
    const dapps = computed<DappCombinedInfo[]>(() =>
      store.getters['dapps/getRegisteredDapps'](props.tag)
    );

    return {
      ...toRefs(props),
      dapps,
    };
  },
});
</script>

<style scoped>
.list-container {
  display: flex;
  flex-wrap: wrap;
}
</style>
