<template>
  <div>
    <div class="row--astars">
      <button
        class="card--astar box--hover--active"
        :class="selNetworkId === endpointKey.ASTAR && 'border--active'"
        @click="setSelNetwork(endpointKey.ASTAR)"
      >
        <img class="img--astar" :src="require('src/assets/img/chain/astar.png')" alt="logo-astar" />
        <span class="text--title">{{ $t('drawer.astarL1') }}</span>
        <div class="line--bottom-bg bottom--l1" />
      </button>

      <button
        class="card--astar box--hover--active"
        :disabled="true"
        :class="selNetworkId === endpointKey.ASTAR_ZKEVM && 'border--active'"
        @click="setSelNetwork(endpointKey.ASTAR_ZKEVM)"
      >
        <img
          class="img--astar"
          :src="require('src/assets/img/chain/zkatana-logo.png')"
          alt="logo-astar-zkevm"
        />
        <span class="text--title">{{ $t('drawer.astarZkL2') }}</span>
        <div class="line--bottom-bg bottom--zkevm" />
      </button>
    </div>

    <div class="container--other-networks">
      <div class="row--title-other">
        <span class="text--network">{{ $t('drawer.otherNetworks') }}</span>
      </div>
      <div class="row--shiden">
        <button
          class="row--network box--hover--active"
          :class="selNetworkId === endpointKey.SHIDEN && 'border--active'"
          @click="setSelNetwork(endpointKey.SHIDEN)"
        >
          <img
            class="img--network-logo"
            :src="require('src/assets/img/chain/shiden.png')"
            alt="logo-shiden"
          />
          <span class="text--network">{{ $t('drawer.shidenNetwork') }}</span>
        </button>
      </div>
      <div class="row--testnets">
        <button
          class="row--network box--hover--active"
          :class="selNetworkId === endpointKey.SHIBUYA && 'border--active'"
          @click="setSelNetwork(endpointKey.SHIBUYA)"
        >
          <img
            class="img--network-logo"
            :src="require('src/assets/img/chain/astar-logo-white.svg')"
            alt="logo-shibuya"
          />
          <span class="text--network">{{ $t('drawer.astarTestnet') }}</span>
        </button>
        <button
          class="row--network box--hover--active"
          :class="selNetworkId === endpointKey.ZKATANA && 'border--active'"
          @click="setSelNetwork(endpointKey.ZKATANA)"
        >
          <img
            class="img--network-logo"
            :src="require('src/assets/img/chain/astar-zkevm-logo-white.svg')"
            alt="logo-zkatana"
          />
          <span class="text--network">{{ $t('drawer.zkTestnet') }}</span>
        </button>
      </div>
      <div v-if="!isZkEvm" class="container--advanced">
        <div class="row--title-advanced">
          <span class="text--network">{{ $t('drawer.advanced') }}</span>
          <button
            class="icon--expand"
            :class="isExpand && 'icon--collapse'"
            @click="expandNetwork(isExpand)"
          >
            <astar-icon-base>
              <astar-icon-3dots />
            </astar-icon-base>
            <q-tooltip>
              <span class="text--tooltip">
                {{ $t(isExpand ? 'assets.collapse' : 'assets.expand') }}
              </span>
            </q-tooltip>
          </button>
        </div>
        <div class="expand-container">
          <div :id="isExpand ? 'network-expand' : 'network-expand-close'">
            <div class="container--endpoints">
              <div
                v-if="selNetworkId !== endpointKey.CUSTOM && selNetworkId !== endpointKey.LOCAL"
                class="box--endpoints"
              >
                <div class="title--endpoint">
                  <span class="text--network">
                    {{ providerEndpoints[selNetworkId].displayName.replace('Network', '') }}
                    {{ isZkEvm ? 'RPC' : 'Endpoint' }}
                  </span>
                </div>
                <div>
                  <div class="column--options">
                    <div
                      v-for="(endpointObj, i) in providerEndpoints[selNetworkId].endpoints"
                      :key="i"
                    >
                      <div
                        class="column--network-option"
                        @click="setSelEndpoint({ endpointObj, networkIdx: selNetworkId })"
                      >
                        <div class="box-input--endpoint">
                          <input
                            name="choose_endpoint"
                            type="radio"
                            :checked="
                              checkIsCheckedEndpoint({
                                index: selNetworkId,
                                endpoint: endpointObj.endpoint,
                              })
                            "
                            class="input--endpoint"
                          />
                        </div>
                        <span class="text--endpoint">{{ endpointObj.name }}</span>
                      </div>
                    </div>
                    <div v-if="isSelectLightClient" class="box--light-client-warning">
                      <span class="text--accent">
                        {{ $t('drawer.lightClientWarning') }}
                      </span>
                      <ul v-if="isLightClientExtension" class="ul--warnings">
                        <li>
                          <span>
                            {{ $t('drawer.takeLongerTimeToConnect') }}
                          </span>
                        </li>
                        <li>
                          <span> {{ $t('drawer.takeLongerTimeToSend') }}</span>
                        </li>
                        <li v-if="selNetworkId === endpointKey.SHIBUYA">
                          <span>
                            {{ $t('drawer.shibuyaTakes20mins') }}
                          </span>
                        </li>
                      </ul>
                      <div v-else>
                        <ul class="ul--warnings">
                          <li>
                            <span>
                              {{
                                $t('installWallet.installWallet', {
                                  value: 'Substrate_connect',
                                })
                              }}
                            </span>
                            <a
                              class="text--download"
                              href="https://substrate.io/developers/substrate-connect/"
                              target="_blank"
                              rel="noreferrer"
                            >
                              {{ $t('installWallet.installSubstrateConnect') }}
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="row--custom-endpoints">
                <button
                  class="box--endpoints box--hover--active"
                  :class="selNetworkId === endpointKey.LOCAL && 'border--active'"
                  @click="setSelNetwork(endpointKey.LOCAL)"
                >
                  <span class="text--network">{{ $t('drawer.localNetwork') }}</span>
                </button>
                <button
                  class="box--endpoints box--hover--active"
                  :class="selNetworkId === endpointKey.CUSTOM && 'border--active'"
                  @click="setSelNetwork(endpointKey.CUSTOM)"
                >
                  <span class="text--network">{{ $t('drawer.customNetwork') }}</span>
                </button>
              </div>
              <div v-if="selNetworkId === endpointKey.CUSTOM">
                <input
                  type="text"
                  placeholder="ws://127.0.0.1:9944"
                  class="ip-input"
                  @input="(e) => setCustomEndpoint(e)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row--action-buttons">
      <astar-button class="button--action" @click="setIsNetwork(false)">
        {{ $t('drawer.selectWallet') }}
      </astar-button>
      <astar-button class="button--action" :disabled="isDisabled" @click="() => selectNetwork()">
        {{ $t('drawer.changeNetwork') }}
      </astar-button>
    </div>
  </div>
</template>
<script lang="ts">
import { endpointKey, providerEndpoints } from 'src/config/chainEndpoints';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  props: {
    selNetworkId: {
      type: Number,
      required: true,
    },
    selectNetwork: {
      type: Function,
      required: true,
    },
    setSelNetwork: {
      type: Function,
      required: true,
    },
    setSelEndpoint: {
      type: Function,
      required: true,
    },
    setCustomEndpoint: {
      type: Function,
      required: true,
    },
    setIsNetwork: {
      type: Function,
      required: true,
    },
    checkIsCheckedEndpoint: {
      type: Function,
      required: true,
    },
    isZkEvm: {
      type: Boolean,
      required: true,
    },
    isSelectLightClient: {
      type: Boolean,
      required: true,
    },
    isLightClientExtension: {
      type: Boolean,
      required: true,
    },
    isDisabled: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    const isExpand = ref<boolean>(false);

    // Ref: https://stackoverflow.com/questions/48143381/css-expand-contract-animation-to-show-hide-content
    const expandNetwork = async (isOpen: boolean): Promise<void> => {
      isExpand.value = !isOpen;
      const el = document.getElementById(isOpen ? 'network-expand' : 'network-expand-close');
      el && el.classList.toggle('network-expanded');
      el && el.classList.toggle('network-collapsed');
    };

    return {
      expandNetwork,
      isExpand,
      endpointKey,
      providerEndpoints,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/header/styles/modal-network-wallet.scss';
</style>
