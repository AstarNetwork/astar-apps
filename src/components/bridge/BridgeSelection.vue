<template>
  <div class="wrapper--bridge-selection">
    <div class="container--selection">
      <div class="column--selection">
        <button :disabled="!isEnableEthBridge">
          <router-link :to="buildEthereumBridgePageLink()" class="button--bridge">
            <div class="row--title">
              <img class="img--logo" :src="require('src/assets/img/ethereum.png')" alt="ethereum" />
              <span class="text--bridge-title">{{ $t('bridge.ethereumBridge.title') }}</span>
            </div>
            <div class="box--text-bridge">
              <span class="text--bridge">
                {{ $t('bridge.ethereumBridge.text', { l1: l1Name, l2: l2Name }) }}
              </span>
            </div>
          </router-link>
        </button>
        <p class="text--bridge">
          {{ $t('bridge.ethereumBridge.text2') }}
          <a
            href="https://docs.astar.network/docs/build/zkEVM/bridge-to-zkevm"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ $t('bridge.ethereumBridge.lean') }}
          </a>
        </p>
      </div>

      <div class="column--selection">
        <button :disabled="!isEnableAstrBridge">
          <router-link :to="buildEthereumBridgePageLink()" class="button--bridge">
            <div class="row--title">
              <img
                class="img--logo"
                :src="require('src/assets/img/chain/astar.png')"
                alt="ethereum"
              />
              <span class="text--bridge-title">{{ $t('bridge.astarBridge.title') }}</span>
            </div>
            <div class="box--text-bridge">
              <span class="text--bridge">
                {{
                  $t('bridge.astarBridge.text', { substrateNetwork: substrateNetwork, l2: l2Name })
                }}
              </span>
            </div>
          </router-link>
        </button>
        <p class="text--bridge">{{ $t('bridge.astarBridge.text2') }}</p>
      </div>

      <div class="column--selection">
        <button>
          <a
            :href="cbridgeAppLink"
            target="_blank"
            rel="noopener noreferrer"
            class="button--bridge"
          >
            <div class="row--title">
              <img
                class="img--logo"
                :src="require('src/assets/img/cbridge_logo.svg')"
                alt="ethereum"
              />
              <span class="text--bridge-title">{{ $t('bridge.celetBridge.title') }}</span>
            </div>
            <span class="text--bridge">{{
              $t('bridge.celetBridge.text', { cbridgeNetworkName: cbridgeNetworkName })
            }}</span>
          </a>
        </button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { cbridgeAppLink } from 'src/c-bridge';
import { useAccount, useNetworkInfo, useWalletConnect } from 'src/hooks';
import { EthBridgeNetworkName } from 'src/modules/zk-evm-bridge';
import { Path as RoutePath, buildEthereumBridgePageLink } from 'src/router/routes';
import { computed, defineComponent } from 'vue';

export default defineComponent({
  components: {},
  setup() {
    useWalletConnect();
    const { currentAccount } = useAccount();
    const { isZkEvm, currentNetworkName, networkNameSubstrate, isMainnet } = useNetworkInfo();

    const l1Name = computed<string>(() => {
      return currentNetworkName.value === EthBridgeNetworkName.Zkatana
        ? EthBridgeNetworkName.Sepolia
        : EthBridgeNetworkName.Ethereum;
    });

    const l2Name = computed<string>(() => {
      return currentNetworkName.value === EthBridgeNetworkName.Zkatana
        ? EthBridgeNetworkName.Zkatana
        : EthBridgeNetworkName.AstarZk;
    });

    const substrateNetwork = computed<string>(() => {
      return currentNetworkName.value === EthBridgeNetworkName.Zkatana ? 'Shibuya' : 'Astar';
    });

    const cbridgeNetworkName = computed<string>(() => {
      return !isZkEvm.value && isMainnet.value ? networkNameSubstrate.value : 'Astar';
    });

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
      l1Name,
      l2Name,
      substrateNetwork,
      cbridgeNetworkName,
      buildEthereumBridgePageLink,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/bridge/styles/bridge-selection.scss';
</style>
