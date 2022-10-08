<template>
  <div v-if="dapp">
    <DappAvatar :dapp="dapp" />
  </div>
</template>
<script lang="ts">
import { useNetworkInfo, useStakingList } from 'src/hooks';
import { Path } from 'src/router';
import { useStore } from 'src/store';
import { computed, defineComponent, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import DappAvatar from 'src/components/dapp-staking/dapp/DappAvatar.vue';

export type StakeRightUi = 'information' | 'select-funds-from';

export default defineComponent({
  components: { DappAvatar },
  setup() {
    const { currentNetworkName } = useNetworkInfo();
    const route = useRoute();

    const store = useStore();
    const { dapps, stakingList } = useStakingList();
    const dappAddress = computed<string>(() => route.query.dapp as string);

    const dispatchGetDapps = (): void => {
      const isDispatch = currentNetworkName.value && dapps.value.length === 0;
      if (isDispatch) {
        store.dispatch('dapps/getDapps', {
          network: currentNetworkName.value.toLowerCase(),
          currentAccount: '',
        });
      }
    };

    const dapp = computed(() => {
      if (dapps.value.length > 0 && dappAddress.value) {
        // Todo: fix the type annotation
        return dapps.value.find((it: any) => {
          try {
            return it.dapp.address.toLowerCase() === dappAddress.value.toLowerCase();
          } catch (error) {
            return null;
          }
        });
      }
      return null;
    });

    watchEffect(dispatchGetDapps);

    watchEffect(() => {
      console.log('dapp', dapp.value);
    });

    return {
      Path,
      dapp,
      stakingList,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dapp-staking/dapp/styles/dapp.scss';
</style>
