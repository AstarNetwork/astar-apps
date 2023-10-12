<template>
  <div class="wrapper--bridge-selection">
    <div class="container--selection">
      <button :disabled="!isEnableEthBridge">
        <router-link :to="buildL1BridgePageLink()" class="button--bridge">
          <div class="row--title">
            <img class="img--logo" :src="require('src/assets/img/ethereum.png')" alt="ethereum" />
            <span class="text--xl">Ethereum Bridge</span>
          </div>
          <span class="text--lg">Bridge assets between Ethereum and Astar zkEVM</span>
        </router-link>
      </button>
      <button :disabled="!isEnableAstrBridge">
        <router-link :to="buildL1BridgePageLink()" class="button--bridge">
          <div class="row--title">
            <img
              class="img--logo"
              :src="require('src/assets/img/chain/astar.png')"
              alt="ethereum"
            />
            <span class="text--xl">Astar Bridge</span>
          </div>
          <span class="text--lg">Bridge assets between Astar Polkadot EVM and Astar zkEVM</span>
        </router-link>
      </button>
      <button>
        <a :href="cbridgeAppLink" target="_blank" rel="noopener noreferrer" class="button--bridge">
          <div class="row--title">
            <img
              class="img--logo"
              :src="require('src/assets/img/cbridge_logo.svg')"
              alt="ethereum"
            />
            <span class="text--xl">Celer Bridge</span>
          </div>
          <span class="text--lg">Bridge assets to Astar Polkadot EVM via cBridge</span>
        </a>
      </button>
    </div>
  </div>
</template>
<script lang="ts">
import { cbridgeAppLink } from 'src/c-bridge';
import { useAccount, useNetworkInfo } from 'src/hooks';
import { EthBridgeNetworkName } from 'src/modules/zk-evm-bridge';
import { Path as RoutePath, buildL1BridgePageLink } from 'src/router/routes';
import { computed, defineComponent } from 'vue';

export default defineComponent({
  components: {},
  setup() {
    const { currentAccount } = useAccount();
    const { isZkEvm, currentNetworkName } = useNetworkInfo();

    const isEnableEthBridge = computed<boolean>(() => {
      if (!isZkEvm.value || currentNetworkName.value === EthBridgeNetworkName.AstarZk) {
        return false;
      }
      return true;
    });

    // Memo: waiting for Stargate to deliver
    const isEnableAstrBridge = computed<boolean>(() => {
      return false;
    });

    return {
      currentAccount,
      cbridgeAppLink,
      RoutePath,
      isEnableAstrBridge,
      isEnableEthBridge,
      buildL1BridgePageLink,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/bridge/styles/bridge-selection.scss';
</style>
