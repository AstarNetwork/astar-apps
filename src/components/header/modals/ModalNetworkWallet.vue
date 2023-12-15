<template>
  <astar-modal-drawer :show="isOpen" :is-closing="isClosing" @close="closeModal">
    <div class="wrapper--modal-network-tab">
      <div class="row--tab">
        <network-wallet-tab :is-network="isNetwork" :set-is-network="setIsNetwork" />
      </div>
      <div class="container--network-ads">
        <div class="box--networks">
          <div v-if="isNetwork">
            <div class="row--astars">
              <button class="card--astar">
                <img class="img--astar" :src="require('src/assets/img/chain/astar.png')" alt="" />
                <span class="text--title">Astar (L1)</span>
              </button>

              <button class="card--astar">
                <img
                  class="img--astar"
                  :src="require('src/assets/img/chain/zkatana-logo.png')"
                  alt="logo-astar"
                />
                <span class="text--title">Astar zkEVM(L2)</span>
              </button>
            </div>

            <div class="container--other-networks">
              <div class="row--title-other">
                <span class="text--network">Other networks</span>
              </div>
              <div class="row--shiden">
                <button class="row--network">
                  <img
                    class="img--network-logo"
                    :src="require('src/assets/img/chain/shiden.png')"
                    alt="logo-shiden"
                  />
                  <span class="text--network">Shiden Network</span>
                </button>
              </div>
              <div class="row--testnets">
                <button class="row--network">
                  <img
                    class="img--network-logo"
                    :src="require('src/assets/img/chain/astar-logo-white.svg')"
                    alt="logo-shibuya"
                  />
                  <span class="text--network">Astar Testnet</span>
                </button>
                <button class="row--network">
                  <img
                    class="img--network-logo"
                    :src="require('src/assets/img/chain/astar-zkevm-logo-white.svg')"
                    alt="logo-zkatana"
                  />
                  <span class="text--network">zkEVM Testnet</span>
                </button>
              </div>
              <div class="container--advanced">
                <div class="row--title-advanced">
                  <span class="text--network">Advanced</span>
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
                      <div class="box--endpoints">
                        <div class="title--endpoint">
                          <span class="text--network">Astar RPC</span>
                        </div>
                        <div>
                          <div class="column--options">
                            <div
                              v-for="(endpointObj, i) in providerEndpoints[0].endpoints"
                              :key="i"
                            >
                              <div
                                class="column--network-option"
                                @click="setSelEndpoint({ endpointObj, networkIdx: 0 })"
                              >
                                <div class="box-input--endpoint">
                                  <input
                                    name="choose_endpoint"
                                    type="radio"
                                    :checked="
                                      checkIsCheckedEndpoint({
                                        index: 0,
                                        endpoint: endpointObj.endpoint,
                                      })
                                    "
                                    class="input--endpoint"
                                  />
                                </div>
                                <span class="text--endpoint">{{ endpointObj.name }}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="row--custom-endpoints">
                        <button class="box--endpoints">
                          <span class="text--network">Local Network</span>
                        </button>
                        <button class="box--endpoints">
                          <span class="text--network">Custom Network</span>
                        </button>
                      </div>
                      <div>
                        <input
                          v-model="newEndpoint"
                          type="text"
                          placeholder="ws://127.0.0.1:9944"
                          class="ip-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <astar-button class="button--action">Next</astar-button>
          </div>
          <div v-if="!isNetwork">
            <span>wallet</span>
            <astar-button class="button--action">Confirm</astar-button>
          </div>
        </div>
        <div>
          <span>Welcome to Astar Network</span>
        </div>
      </div>
    </div>
  </astar-modal-drawer>
</template>
<script lang="ts">
import {
  checkIsLightClient,
  checkIsSubstrateConnectInstalled,
} from 'src/config/api/polkadot/connectApi';
import { ChainProvider, endpointKey, providerEndpoints } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { getRandomFromArray, wait } from '@astar-network/astar-sdk-core';
import { buildNetworkUrl } from 'src/router/utils';
import { computed, defineComponent, ref, watch, onUnmounted, watchEffect } from 'vue';
import { useAccount, useNetworkInfo } from 'src/hooks';
import { useStore } from 'src/store';
import NetworkWalletTab from './NetworkWalletTab.vue';

export default defineComponent({
  components: { NetworkWalletTab },
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
    networkIdx: {
      type: Number,
      required: true,
    },
  },
  emits: ['update:select-network', 'update:is-open'],
  setup(props, { emit }) {
    const isExpand = ref<boolean>(false);

    // Ref: https://stackoverflow.com/questions/48143381/css-expand-contract-animation-to-show-hide-content
    const expandNetwork = async (isOpen: boolean): Promise<void> => {
      isExpand.value = !isOpen;
      const el = document.getElementById(isOpen ? 'network-expand' : 'network-expand-close');
      el && el.classList.toggle('network-expanded');
      el && el.classList.toggle('network-collapsed');
    };

    const classRadioOn = 'class-radio-on';
    const classRadioOff = 'class-radio-off';

    const newEndpoint = ref('');
    const isLightClientExtension = computed<boolean>(() => checkIsSubstrateConnectInstalled());

    const { isZkEvm } = useNetworkInfo();
    const store = useStore();
    const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
    const { currentAccount } = useAccount();

    const checkIsDisabledZkOption = (provider: ChainProvider): boolean => {
      return !isH160.value && provider.displayName.toLowerCase().includes('zk');
    };

    const setInitialNewEndpoint = (): string => {
      const selectedEndpointStored = String(localStorage.getItem(LOCAL_STORAGE.SELECTED_ENDPOINT));
      const selectedEndpoint = JSON.parse(selectedEndpointStored);
      const networkId = Object.keys(selectedEndpoint)[0];
      const connectedCustomEndpoint = Object.values(selectedEndpoint)[0] as string;
      return networkId === String(endpointKey.CUSTOM) ? connectedCustomEndpoint : '';
    };
    newEndpoint.value = setInitialNewEndpoint();

    const isClosing = ref<boolean>(false);

    const closeModal = async (): Promise<void> => {
      isClosing.value = true;
      const animationDuration = 500;
      await wait(animationDuration);
      isClosing.value = false;
      emit('update:is-open', false);
    };

    const { NETWORK_IDX, SELECTED_ENDPOINT } = LOCAL_STORAGE;

    const getSelectedNetwork = (networkIdx: number): string => {
      switch (networkIdx) {
        case endpointKey.ASTAR:
          return selEndpointAstar.value;
        case endpointKey.SHIDEN:
          return selEndpointShiden.value;
        case endpointKey.SHIBUYA:
          return selEndpointShibuya.value;
        case endpointKey.ZKATANA:
          return selEndpointZkatana.value;
        case endpointKey.ASTAR_ZKEVM:
          return selEndpointAstarZkevm.value;

        default:
          return selEndpointAstar.value;
      }
    };

    const selectNetwork = async (networkIdx: number): Promise<void> => {
      localStorage.setItem(NETWORK_IDX, networkIdx.toString());
      localStorage.setItem(
        SELECTED_ENDPOINT,
        JSON.stringify({
          [networkIdx]:
            newEndpoint.value && selNetwork.value === endpointKey.CUSTOM
              ? newEndpoint.value
              : getSelectedNetwork(networkIdx),
        })
      );

      const network = providerEndpoints[networkIdx].networkAlias;
      const url = buildNetworkUrl(network);

      window.open(url, '_self');

      emit('update:is-open', false);
      emit('update:select-network', networkIdx);
    };

    const setInitialSelEndpoint = (): string => {
      return JSON.parse(localStorage.getItem(SELECTED_ENDPOINT) || '{}')[props.networkIdx] || '';
    };

    const selNetwork = ref<number>(props.networkIdx);
    const selEndpointAstar = ref<string>('');
    const selEndpointShiden = ref<string>('');
    const selEndpointShibuya = ref<string>('');
    const selEndpointAstarZkevm = ref<string>('');
    const selEndpointZkatana = ref<string>('');

    const isDisabled = computed<boolean>(() => {
      if (isSelectLightClient.value) {
        return !isLightClientExtension.value;
      } else {
        return selNetwork.value === endpointKey.CUSTOM && !newEndpoint.value;
      }
    });

    const isCustomNetwork = computed<boolean>(() => selNetwork.value === endpointKey.CUSTOM);
    const isSelectLightClient = computed<boolean>(() => {
      switch (selNetwork.value) {
        case endpointKey.ASTAR:
          return checkIsLightClient(selEndpointAstar.value);
        case endpointKey.SHIDEN:
          return checkIsLightClient(selEndpointShiden.value);
        case endpointKey.SHIBUYA:
          return checkIsLightClient(selEndpointShibuya.value);
        default:
          return false;
      }
    });

    const checkIsCheckedEndpoint = ({
      index,
      endpoint,
    }: {
      index: number;
      endpoint: string;
    }): boolean => {
      return index === endpointKey.ASTAR
        ? selEndpointAstar.value === endpoint
        : index === endpointKey.SHIDEN
        ? selEndpointShiden.value === endpoint
        : index === endpointKey.SHIBUYA
        ? selEndpointShibuya.value === endpoint
        : index === endpointKey.ASTAR_ZKEVM
        ? selEndpointAstarZkevm.value === endpoint
        : selEndpointZkatana.value === endpoint;
    };

    const setSelEndpoint = ({
      endpointObj,
      networkIdx,
    }: {
      endpointObj: { name: string; endpoint: string };
      networkIdx: number;
      selEndpointRef: string;
    }): void => {
      if (networkIdx === endpointKey.ASTAR) {
        selEndpointAstar.value = endpointObj.endpoint;
      } else if (networkIdx === endpointKey.SHIDEN) {
        selEndpointShiden.value = endpointObj.endpoint;
      } else if (networkIdx === endpointKey.SHIBUYA) {
        selEndpointShibuya.value = endpointObj.endpoint;
      } else if (networkIdx === endpointKey.ASTAR_ZKEVM) {
        selEndpointAstarZkevm.value = endpointObj.endpoint;
      } else if (networkIdx === endpointKey.ZKATANA) {
        selEndpointZkatana.value = endpointObj.endpoint;
      }
    };

    const getRandomizedEndpoint = (endpointKey: endpointKey): string => {
      const endpointsWithoutLightClient = providerEndpoints[endpointKey].endpoints.filter(
        (it) => !checkIsLightClient(it.endpoint)
      );
      return getRandomFromArray(endpointsWithoutLightClient).endpoint;
    };

    const randomizedEndpoint = (networkIdx: number): void => {
      if (networkIdx === endpointKey.ASTAR) {
        selEndpointAstar.value = getRandomizedEndpoint(endpointKey.ASTAR);
      }
      if (networkIdx === endpointKey.SHIDEN) {
        selEndpointShiden.value = getRandomizedEndpoint(endpointKey.SHIDEN);
      }
      if (networkIdx === endpointKey.SHIBUYA) {
        selEndpointShibuya.value = getRandomizedEndpoint(endpointKey.SHIBUYA);
      }
      if (networkIdx === endpointKey.ASTAR_ZKEVM) {
        selEndpointAstarZkevm.value = getRandomizedEndpoint(endpointKey.ASTAR_ZKEVM);
      }
      if (networkIdx === endpointKey.ZKATANA) {
        selEndpointZkatana.value = getRandomizedEndpoint(endpointKey.ZKATANA);
      }
    };

    const setupInitialEndpointOption = (networkIdx: number) => {
      if (networkIdx === endpointKey.ASTAR) {
        selEndpointAstar.value = setInitialSelEndpoint();
        randomizedEndpoint(endpointKey.SHIDEN);
        randomizedEndpoint(endpointKey.SHIBUYA);
        randomizedEndpoint(endpointKey.ASTAR_ZKEVM);
        randomizedEndpoint(endpointKey.ZKATANA);
        return;
      }

      if (networkIdx === endpointKey.SHIDEN) {
        selEndpointShiden.value = setInitialSelEndpoint();
        randomizedEndpoint(endpointKey.ASTAR);
        randomizedEndpoint(endpointKey.SHIBUYA);
        randomizedEndpoint(endpointKey.ASTAR_ZKEVM);
        randomizedEndpoint(endpointKey.ZKATANA);
        return;
      }

      if (networkIdx === endpointKey.SHIBUYA) {
        selEndpointShibuya.value = setInitialSelEndpoint();
        randomizedEndpoint(endpointKey.ASTAR);
        randomizedEndpoint(endpointKey.SHIDEN);
        randomizedEndpoint(endpointKey.ASTAR_ZKEVM);
        randomizedEndpoint(endpointKey.ZKATANA);
        return;
      }
      if (networkIdx === endpointKey.ASTAR_ZKEVM) {
        selEndpointShibuya.value = setInitialSelEndpoint();
        randomizedEndpoint(endpointKey.ASTAR);
        randomizedEndpoint(endpointKey.SHIDEN);
        randomizedEndpoint(endpointKey.SHIBUYA);
        randomizedEndpoint(endpointKey.ZKATANA);
        return;
      }
      if (networkIdx === endpointKey.ZKATANA) {
        selEndpointShibuya.value = setInitialSelEndpoint();
        randomizedEndpoint(endpointKey.ASTAR);
        randomizedEndpoint(endpointKey.SHIDEN);
        randomizedEndpoint(endpointKey.SHIBUYA);
        randomizedEndpoint(endpointKey.ASTAR_ZKEVM);
        return;
      }
    };

    watch(
      [selNetwork],
      () => {
        setupInitialEndpointOption(props.networkIdx);
      },
      { immediate: true }
    );

    const windowHeight = ref<number>(window.innerHeight);
    const onHeightChange = () => {
      windowHeight.value = window.innerHeight - 300;
    };

    window.addEventListener('resize', onHeightChange);
    onHeightChange();

    onUnmounted(() => {
      window.removeEventListener('resize', onHeightChange);
    });

    const isNetwork = ref<boolean>(true);
    const setIsNetwork = (result: boolean): void => {
      isNetwork.value = result;
    };

    watchEffect(() => {
      console.log('selEndpointAstar', selEndpointAstar.value);
      console.log('selEndpointAstar', selEndpointShiden.value);
      console.log('selEndpointAstar', selEndpointShibuya.value);
      console.log('selEndpointAstar', selEndpointAstarZkevm.value);
      console.log('selEndpointAstar', selEndpointZkatana.value);
    });

    return {
      isClosing,
      closeModal,
      isNetwork,
      setIsNetwork,
      expandNetwork,
      isExpand,

      newEndpoint,
      selNetwork,
      classRadioOn,
      classRadioOff,
      providerEndpoints,
      endpointKey,
      isDisabled,
      isCustomNetwork,
      selEndpointAstar,
      selEndpointShiden,
      selEndpointShibuya,
      windowHeight,
      isSelectLightClient,
      isLightClientExtension,
      isZkEvm,
      isH160,
      setSelEndpoint,
      checkIsCheckedEndpoint,
      selectNetwork,
      checkIsDisabledZkOption,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/header/styles/modal-network-wallet.scss';

/* Memo: somehow these classes won't work in light theme if the classes defined on modal-network.scss  */
/* .box--light-client-warning {
  display: none;
  @media (min-width: $sm) {
    display: flex;
    flex-direction: column;
    row-gap: 8px;
    margin-top: 24px;
  }
}

.ul--warnings {
  list-style: disc;
  text-align: left;
  padding-left: 24px;
}

.text--download {
  display: block;
  text-decoration: underline;
  color: $astar-blue;
} */
</style>
