<template>
  <div class="container">
    <div class="wrapper--your-project">
      <div class="row--title">
        <span class="text--title">Your Project</span>
      </div>
      <div class="separator" />
      <div class="box--dapps">
        <div class="card--dapp">
          <div>Img</div>
          <div>Name</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useAccount, useClaimAll, useNetworkInfo } from 'src/hooks';
import { CombinedDappInfo, useDapps } from 'src/staking-v3';
import { computed, defineComponent, ref, watch } from 'vue';

export default defineComponent({
  setup() {
    const { currentAccount } = useAccount();
    const { nativeTokenSymbol, currentNetworkIdx } = useNetworkInfo();
    useClaimAll();
    const { registeredDapps } = useDapps();
    const ownDapps = computed<CombinedDappInfo[]>(() => {
      if (!registeredDapps.value) return [];
      return registeredDapps.value.filter((dapp) => dapp.chain.owner === currentAccount.value);
    });
    return {};
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/your-project.scss';
</style>
