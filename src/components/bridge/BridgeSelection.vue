<template>
  <div class="wrapper--bridge-selection">
    <div class="container--box">
      <div class="container--title">
        <span>{{ $t('bridge.selectBridge') }}</span>
      </div>
      <div class="container--bridges">
        <div class="column--selection">
          <button :disabled="!isEnableCcipBridge">
            <component
              :is="isEnableCcipBridge ? 'router-link' : 'div'"
              :to="ccipSoneiumLink"
              class="button--bridge"
            >
              <div class="row--logo-bg">
                <div class="img--logo-bg box--ethereum-soneium">
                  <img
                    class="img--logo"
                    :src="require('src/assets/img/chain/ethereum-gray.svg')"
                    alt="ethereum"
                  />
                </div>
                <div class="box-soneium-logo">
                  <div class="img--logo-bg">
                    <img
                      class="img--logo-soneium"
                      :src="require('src/assets/img/chain/soneium-color.svg')"
                      alt="soneium"
                    />
                  </div>
                </div>
              </div>
              <div class="row--bridge-title">
                <div class="text--bridge-tag">
                  <q-chip outline>
                    {{
                      $t(isShibuyaEvm ? 'bridge.ccipSbyBridge.tag' : 'bridge.ccipAstrBridge.tag')
                    }}
                  </q-chip>
                </div>
                <span class="text--bridge-title">{{
                  $t(isShibuyaEvm ? 'bridge.ccipSbyBridge.title' : 'bridge.ccipAstrBridge.title')
                }}</span>
                <div class="box--text-bridge">
                  <span class="text--bridge">
                    {{
                      $t(isShibuyaEvm ? 'bridge.ccipSbyBridge.text' : 'bridge.ccipAstrBridge.text')
                    }}
                  </span>
                </div>
              </div>
            </component>
          </button>
          <p v-if="!isAstarEvm && !isShibuyaEvm" class="text--bridge-details">
            {{ $t('bridge.ccipAstrBridge.remark') }}
          </p>
        </div>

        <div class="column--selection">
          <button>
            <component
              :is="true ? 'router-link' : 'div'"
              :to="buildTransferPageLink(nativeTokenSymbol)"
              class="button--bridge"
            >
              <div class="row--logo-bg">
                <div class="img--logo-bg">
                  <img
                    class="img--logo-soneium"
                    :src="require('src/assets/img/astar_icon2.svg')"
                    alt="astar"
                  />
                </div>
              </div>
              <div class="row--bridge-title">
                <div class="text--bridge-tag">
                  <q-chip outline>
                    {{ nativeTokenSymbol }}
                  </q-chip>
                </div>
                <span class="text--bridge-title">{{ $t('bridge.astarEvmBridge.title') }}</span>
                <div class="box--text-bridge">
                  <span class="text--bridge">
                    {{ $t('bridge.astarEvmBridge.text') }}
                  </span>
                </div>
              </div>
            </component>
          </button>
        </div>

        <div class="column--selection">
          <button
            :disabled="!stargateBridgeEnabled"
            class="button--bridge"
            @click="navigateInNewTab(stargateBridgeLink)"
          >
            <div class="row--logo-bg">
              <div class="img--logo-bg">
                <img
                  class="img--logo-stargate"
                  :src="require('src/assets/img/logo-stargate.webp')"
                  alt="stargate"
                />
              </div>
            </div>
            <div class="row--bridge-title">
              <div class="text--bridge-tag">
                <q-chip outline>
                  {{ $t('bridge.stargateBridge.tag') }}
                </q-chip>
              </div>
              <span class="text--bridge-title">{{ $t('bridge.stargateBridge.title') }}</span>
              <div class="box--text-bridge">
                <span class="text--bridge">
                  {{ $t('bridge.stargateBridge.text') }}
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
import {
  ccipMinatoBridgeEnabled,
  celerBridgeEnabled,
  layerSwapBridgeEnabled,
  layerZeroBridgeEnabled,
  ccipSoneiumBridgeEnabled,
  ccipSepoliaBridgeEnabled,
  ccipEthereumBridgeEnabled,
  nativeBridgeEnabled,
  stargateBridgeEnabled,
  ccipShibuyaBridgeEnabled,
  ccipAstarBridgeEnabled,
} from 'src/features';
import { useAccount, useNetworkInfo } from 'src/hooks';
import { EthBridgeNetworkName } from 'src/modules/zk-evm-bridge';
import { layerSwapLink, zKatanaBridgeUrl } from 'src/modules/zk-evm-bridge/index';
import { stargateBridgeLink } from 'src/links/index';
import {
  Path as RoutePath,
  buildCcipBridgePageLink,
  buildEthereumBridgePageLink,
  buildLzBridgePageLink,
  buildTransferPageLink,
} from 'src/router/routes';
import { navigateInNewTab } from 'src/util-general';
import { computed, defineComponent } from 'vue';
import { CcipNetworkParam } from 'src/modules/ccip-bridge';

export default defineComponent({
  components: {},
  setup() {
    const { currentAccount } = useAccount();
    const {
      isZkEvm,
      networkNameSubstrate,
      isMainnet,
      isAstarZkEvm,
      isAstar,
      isH160,
      isShibuyaEvm,
      isAstarEvm,
      nativeTokenSymbol,
      ccipSoneiumLink,
    } = useNetworkInfo();

    const l1Name = computed<string>(() => {
      return EthBridgeNetworkName.Ethereum;
    });

    const l2Name = computed<string>(() => {
      return EthBridgeNetworkName.AstarZk;
    });

    const cbridgeNetworkName = computed<string>(() => {
      return !isZkEvm.value && isMainnet.value ? networkNameSubstrate.value : 'Astar';
    });

    const isEnableEthBridge = computed<boolean>(() => isZkEvm.value && nativeBridgeEnabled);

    const isEnableLzBridge = computed<boolean>(() => {
      return isH160.value && (isAstar.value || isAstarZkEvm.value);
    });

    const isEnableCcipBridge = computed<boolean>(() => {
      return isShibuyaEvm.value
        ? ccipMinatoBridgeEnabled && ccipSepoliaBridgeEnabled && ccipShibuyaBridgeEnabled
        : ccipSoneiumBridgeEnabled && ccipEthereumBridgeEnabled && ccipAstarBridgeEnabled;
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
      isEnableLzBridge,
      celerBridgeEnabled,
      layerSwapBridgeEnabled,
      nativeBridgeEnabled,
      layerZeroBridgeEnabled,
      stargateBridgeEnabled,
      isEnableCcipBridge,
      isShibuyaEvm,
      isAstarEvm,
      stargateBridgeLink,
      CcipNetworkParam,
      ccipSoneiumLink,
      buildEthereumBridgePageLink,
      buildLzBridgePageLink,
      navigateInNewTab,
      buildTransferPageLink,
      nativeTokenSymbol,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/bridge/styles/bridge-selection.scss';
</style>
