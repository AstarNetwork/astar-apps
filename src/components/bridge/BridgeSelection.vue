<template>
  <div class="wrapper--bridge-selection">
    <div class="container--box">
      <div class="container--title">
        <span>{{ $t('bridge.selectBridge') }}</span>
      </div>
      <div class="container--selection">
        <div class="column--selection">
          <button :disabled="!isEnableMinatoBridge">
            <component
              :is="isEnableMinatoBridge ? 'router-link' : 'div'"
              :to="buildCcipBridgePageLink()"
              class="button--bridge"
            >
              <div class="row--logo-bg">
                <div class="img--logo-bg">
                  <img
                    class="img--logo-astr"
                    :src="require('src/assets/img/token/astr.png')"
                    alt="astr"
                  />
                </div>
              </div>
              <div class="row--bridge-title">
                <div class="text--bridge-tag">
                  <q-chip outline>
                    {{ $t('bridge.ccipMinatoBridge.tag') }}
                  </q-chip>
                </div>
                <span class="text--bridge-title">{{ $t('bridge.ccipMinatoBridge.title') }}</span>
                <div class="box--text-bridge">
                  <span class="text--bridge">
                    {{ $t('bridge.ccipMinatoBridge.text') }}
                  </span>
                </div>
              </div>
            </component>
          </button>
          <p v-if="!isShibuyaEvm" class="text--bridge-details">
            {{ $t('bridge.ccipMinatoBridge.text2') }}
          </p>
        </div>
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
          <p v-if="!isZkEvm" class="text--bridge-details">
            {{ $t('bridge.ethereumBridge.text2') }}
          </p>
          <p v-if="!nativeBridgeEnabled" class="text--bridge-details">
            {{ $t('bridge.bridgeMaintenanceMode') }}
          </p>
        </div>

        <div class="column--selection">
          <button :disabled="!isEnableLzBridge || !layerZeroBridgeEnabled">
            <component
              :is="isEnableLzBridge && layerZeroBridgeEnabled ? 'router-link' : 'div'"
              :to="buildLzBridgePageLink()"
              class="button--bridge"
            >
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
            </component>
          </button>
          <p v-if="!isEnableLzBridge" class="text--bridge-details">
            {{ $t('bridge.astarBridge.text2') }}
          </p>
          <p v-if="!layerZeroBridgeEnabled" class="text--bridge-details">
            {{ $t('bridge.bridgeMaintenanceMode') }}
          </p>
        </div>
        <div v-if="isZkyoto" class="column--selection">
          <button :disabled="!isEnableEthBridge">
            <a
              :href="zKatanaBridgeUrl"
              target="_blank"
              rel="noopener noreferrer"
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
                    {{ $t('bridge.zKatanaBridge.tag') }}
                  </q-chip>
                </div>
                <span class="text--bridge-title">{{ $t('bridge.zKatanaBridge.title') }}</span>
                <div class="box--text-bridge">
                  <span class="text--bridge">
                    {{ $t('bridge.zKatanaBridge.text') }}
                  </span>
                </div>
              </div>
            </a>
          </button>
        </div>
      </div>
      <div class="container--selection">
        <div class="column--selection">
          <button
            :disabled="!layerSwapBridgeEnabled"
            class="button--bridge"
            @click="navigateInNewTab(layerSwapLink)"
          >
            <div class="row--logo-bg">
              <div class="img--logo-bg">
                <img
                  class="img--logo"
                  :src="require('src/assets/img/layerswap_logo.svg')"
                  alt="layer-swap"
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
          </button>
        </div>
        <div class="column--selection">
          <button
            :disabled="!celerBridgeEnabled"
            class="button--bridge"
            @click="navigateInNewTab(cbridgeAppLink)"
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
          </button>
          <p v-if="!celerBridgeEnabled" class="text--bridge-details">
            {{ $t('bridge.celerBridge.warning') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { cbridgeAppLink } from 'src/c-bridge';
import { useAccount, useNetworkInfo } from 'src/hooks';
import { EthBridgeNetworkName } from 'src/modules/zk-evm-bridge';
import {
  Path as RoutePath,
  buildEthereumBridgePageLink,
  buildLzBridgePageLink,
  buildCcipBridgePageLink,
} from 'src/router/routes';
import { computed, defineComponent } from 'vue';
import { layerSwapLink, zKatanaBridgeUrl } from 'src/modules/zk-evm-bridge/index';
import {
  celerBridgeEnabled,
  layerSwapBridgeEnabled,
  nativeBridgeEnabled,
  layerZeroBridgeEnabled,
  ccipMinatoBridgeEnabled,
} from 'src/features';
import { navigateInNewTab } from 'src/util-general';

export default defineComponent({
  components: {},
  setup() {
    const { currentAccount } = useAccount();
    const {
      isZkEvm,
      networkNameSubstrate,
      isMainnet,
      isZkyoto,
      isAstarZkEvm,
      isAstar,
      isH160,
      isShibuya,
    } = useNetworkInfo();

    const l1Name = computed<string>(() => {
      return isZkyoto.value ? EthBridgeNetworkName.Sepolia : EthBridgeNetworkName.Ethereum;
    });

    const l2Name = computed<string>(() => {
      return isZkyoto.value ? EthBridgeNetworkName.Zkyoto : EthBridgeNetworkName.AstarZk;
    });

    const cbridgeNetworkName = computed<string>(() => {
      return !isZkEvm.value && isMainnet.value ? networkNameSubstrate.value : 'Astar';
    });

    const isEnableEthBridge = computed<boolean>(() => isZkEvm.value && nativeBridgeEnabled);

    const isEnableLzBridge = computed<boolean>(() => {
      return isH160.value && (isAstar.value || isAstarZkEvm.value);
    });

    const isEnableMinatoBridge = computed<boolean>(() => {
      return isH160.value && isShibuya.value && ccipMinatoBridgeEnabled;
    });

    const isShibuyaEvm = computed<boolean>(() => {
      return isH160.value && isShibuya.value;
    });

    return {
      currentAccount,
      cbridgeAppLink,
      RoutePath,
      isEnableEthBridge,
      isZkEvm,
      l1Name,
      l2Name,
      cbridgeNetworkName,
      layerSwapLink,
      zKatanaBridgeUrl,
      isZkyoto,
      isEnableLzBridge,
      celerBridgeEnabled,
      layerSwapBridgeEnabled,
      nativeBridgeEnabled,
      layerZeroBridgeEnabled,
      isEnableMinatoBridge,
      isShibuyaEvm,
      buildEthereumBridgePageLink,
      buildLzBridgePageLink,
      navigateInNewTab,
      buildCcipBridgePageLink,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/bridge/styles/bridge-selection.scss';
</style>
