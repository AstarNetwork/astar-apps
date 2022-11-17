<template>
  <div class="wrapper--onchain-data">
    <div>
      <span>On chain data</span>
    </div>
    <div class="box--data">
      <div class="row--data-filter">
        <div class="dropbox--filter">
          <span>Staking TVL</span>
        </div>
        <div class="column--sort">
          <div>
            <span>Sort by</span>
          </div>
          <div class="dropbox--sort">
            <span>Alphabetical</span>
          </div>
        </div>
      </div>

      <div>
        <div>
          <div>logo</div>
          <div>name</div>
          <div>amount</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  components: {
    // TokenBalance,
  },
  setup() {
    return {};
  },
});
</script>
<style lang="scss" scoped>
@import 'src/components/dapp-staking-v2/my-staking/styles/on-chain-data.scss';
</style>
