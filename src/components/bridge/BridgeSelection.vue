<template>
  <div class="wrapper--bridge-selection">
    <div class="container--box">
      <div class="container--title">
        <span>{{ $t('bridge.selectBridge') }}</span>
      </div>
      <div class="container--selection">
        <div class="column--selection">
          <button :disabled="!isEnableEthBridge">
            <component
              :is="isEnableEthBridge ? 'router-link' : 'div'"
              :to="buildEthereumBridgePageLink()"
              class="button--bridge"
            >
              <div class="row--logo-bg">
                <div class="img--logo-bg">
                  <img
                    class="img--logo"
                    :src="require('src/assets/img/ethereum.png')"
                    alt="ethereum"
                  />
                </div>
              </div>
              <div class="row--bridge-title">
                <div class="text--bridge-tag">
                  <q-chip outline>
                    {{ $t('bridge.ethereumBridge.tag') }}
                  </q-chip>
                </div>
                <span class="text--bridge-title">{{ $t('bridge.ethereumBridge.title') }}</span>
                <div class="box--text-bridge">
                  <span class="text--bridge">
                    {{ $t('bridge.ethereumBridge.text', { l1: l1Name, l2: l2Name }) }}
                  </span>
                </div>
              </div>
            </component>
          </button>
          <p v-if="!isEnableEthBridge" class="text--bridge-details">
            {{ $t('bridge.ethereumBridge.text2') }}
          </p>
        </div>

        <div class="column--selection">
          <button>
            <a :href="stargateUrl" target="_blank" rel="noopener noreferrer" class="button--bridge">
              <div class="row--logo-bg">
                <div class="img--logo-bg">
                  <img
                    class="img--logo"
                    :src="require('src/assets/img/layerzero_bridge_logo.svg')"
                    alt="astar-bridge"
                  />
                </div>
              </div>
              <div class="row--bridge-title">
                <div class="text--bridge-tag">
                  <q-chip outline>
                    {{ $t('bridge.astarBridge.tag') }}
                  </q-chip>
                </div>
                <span class="text--bridge-title">{{ $t('bridge.astarBridge.title') }}</span>
                <div class="box--text-bridge">
                  <span class="text--bridge">
                    {{ $t('bridge.astarBridge.text') }}
                  </span>
                </div>
              </div>
            </a>
          </button>
        </div>
      </div>
      <div class="container--selection">
        <div class="column--selection">
          <button>
            <a
              :href="layerSwapLink"
              target="_blank"
              rel="noopener noreferrer"
              class="button--bridge"
            >
              <div class="row--logo-bg">
                <div class="img--logo-bg">
                  <img
                    class="img--logo"
                    :src="require('src/assets/img/layerswap_logo.svg')"
                    alt="relay-link"
                  />
                </div>
              </div>
              <div class="row--bridge-title">
                <div class="text--bridge-tag">
                  <q-chip outline>
                    {{ $t('bridge.layerSwap.tag') }}
                  </q-chip>
                </div>
                <span class="text--bridge-title">{{ $t('bridge.layerSwap.title') }}</span>
                <div class="box--text-bridge">
                  <span class="text--bridge">
                    {{ $t('bridge.layerSwap.text') }}
                  </span>
                </div>
              </div>
            </a>
          </button>
        </div>
        <div class="column--selection">
          <button>
            <a
              :href="relayBridgeAppLink"
              target="_blank"
              rel="noopener noreferrer"
              class="button--bridge"
            >
              <div class="row--logo-bg">
                <div class="img--logo-bg">
                  <img
                    class="img--logo"
                    :src="require('src/assets/img/relay_bridge_logo.svg')"
                    alt="relay-link"
                  />
                </div>
              </div>
              <div class="row--bridge-title">
                <div class="text--bridge-tag">
                  <q-chip outline>
                    {{ $t('bridge.relayBridge.tag') }}
                  </q-chip>
                </div>
                <span class="text--bridge-title">{{ $t('bridge.relayBridge.title') }}</span>
                <div class="box--text-bridge">
                  <span class="text--bridge">
                    {{ $t('bridge.relayBridge.text', { l1: l1Name, l2: l2Name }) }}
                  </span>
                </div>
              </div>
            </a>
          </button>
        </div>

        <div class="column--selection">
          <button>
            <a
              :href="cbridgeAppLink"
              target="_blank"
              rel="noopener noreferrer"
              class="button--bridge"
            >
              <div class="row--logo-bg">
                <div class="img--logo-bg">
                  <img
                    class="img--logo"
                    :src="require('src/assets/img/cbridge_logo.svg')"
                    alt="cbridge"
                  />
                </div>
              </div>
              <div class="row--bridge-title">
                <div class="text--bridge-tag">
                  <q-chip outline>
                    {{ $t('bridge.celerBridge.tag') }}
                  </q-chip>
                </div>
                <span class="text--bridge-title">{{ $t('bridge.celerBridge.title') }}</span>
                <div class="box--text-bridge">
                  <span class="text--bridge">
                    {{
                      $t('bridge.celerBridge.text', {
                        cbridgeNetworkName,
                      })
                    }}
                  </span>
                </div>
              </div>
            </a>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { cbridgeAppLink } from 'src/c-bridge';
import { useAccount, useNetworkInfo } from 'src/hooks';
import { EthBridgeNetworkName } from 'src/modules/zk-evm-bridge';
import { Path as RoutePath, buildEthereumBridgePageLink } from 'src/router/routes';
import { computed, defineComponent } from 'vue';
import { stargateUrl, layerSwapLink, relayBridgeAppLink } from 'src/modules/zk-evm-bridge/index';

export default defineComponent({
  components: {},
  setup() {
    const { currentAccount } = useAccount();
    const { isZkEvm, networkNameSubstrate, isMainnet, isZkyoto } = useNetworkInfo();

    const l1Name = computed<string>(() => {
      return isZkyoto.value ? EthBridgeNetworkName.Sepolia : EthBridgeNetworkName.Ethereum;
    });

    const l2Name = computed<string>(() => {
      return isZkyoto.value ? EthBridgeNetworkName.Zkyoto : EthBridgeNetworkName.AstarZk;
    });

    const cbridgeNetworkName = computed<string>(() => {
      return !isZkEvm.value && isMainnet.value ? networkNameSubstrate.value : 'Astar';
    });

    const isEnableEthBridge = computed<boolean>(() => {
      if (!isZkEvm.value) {
        return false;
      }
      return true;
    });

    return {
      currentAccount,
      cbridgeAppLink,
      RoutePath,
      isEnableEthBridge,
      l1Name,
      l2Name,
      relayBridgeAppLink,
      cbridgeNetworkName,
      buildEthereumBridgePageLink,
      stargateUrl,
      layerSwapLink,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/bridge/styles/bridge-selection.scss';
</style>
