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
              <button
                class="card--astar box--hover--active"
                :class="selNetwork === endpointKey.ASTAR && 'border--active'"
                @click="setSelNetwork(endpointKey.ASTAR)"
              >
                <img
                  class="img--astar"
                  :src="require('src/assets/img/chain/astar.png')"
                  alt="logo-astar"
                />
                <span class="text--title">Astar (L1)</span>
              </button>

              <button
                class="card--astar box--hover--active"
                :class="selNetwork === endpointKey.ASTAR_ZKEVM && 'border--active'"
                @click="setSelNetwork(endpointKey.ASTAR_ZKEVM)"
              >
                <img
                  class="img--astar"
                  :src="require('src/assets/img/chain/zkatana-logo.png')"
                  alt="logo-astar-zkevm"
                />
                <span class="text--title">Astar zkEVM(L2)</span>
              </button>
            </div>

            <div class="container--other-networks">
              <div class="row--title-other">
                <span class="text--network">Other networks</span>
              </div>
              <div class="row--shiden">
                <button
                  class="row--network box--hover--active"
                  :class="selNetwork === endpointKey.SHIDEN && 'border--active'"
                  @click="setSelNetwork(endpointKey.SHIDEN)"
                >
                  <img
                    class="img--network-logo"
                    :src="require('src/assets/img/chain/shiden.png')"
                    alt="logo-shiden"
                  />
                  <span class="text--network">Shiden Network</span>
                </button>
              </div>
              <div class="row--testnets">
                <button
                  class="row--network box--hover--active"
                  :class="selNetwork === endpointKey.SHIBUYA && 'border--active'"
                  @click="setSelNetwork(endpointKey.SHIBUYA)"
                >
                  <img
                    class="img--network-logo"
                    :src="require('src/assets/img/chain/astar-logo-white.svg')"
                    alt="logo-shibuya"
                  />
                  <span class="text--network">Astar Testnet</span>
                </button>
                <button
                  class="row--network box--hover--active"
                  :class="selNetwork === endpointKey.ZKATANA && 'border--active'"
                  @click="setSelNetwork(endpointKey.ZKATANA)"
                >
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
                      <div
                        v-if="selNetwork !== endpointKey.CUSTOM && selNetwork !== endpointKey.LOCAL"
                        class="box--endpoints"
                      >
                        <div class="title--endpoint">
                          <span class="text--network">
                            {{ providerEndpoints[selNetwork].displayName.replace('Network', '') }}
                            {{ isZkEvm ? 'RPC' : 'Endpoint' }}
                          </span>
                        </div>
                        <div>
                          <div class="column--options">
                            <div
                              v-for="(endpointObj, i) in providerEndpoints[selNetwork].endpoints"
                              :key="i"
                            >
                              <div
                                class="column--network-option"
                                @click="setSelEndpoint({ endpointObj, networkIdx: selNetwork })"
                              >
                                <div class="box-input--endpoint">
                                  <input
                                    name="choose_endpoint"
                                    type="radio"
                                    :checked="
                                      checkIsCheckedEndpoint({
                                        index: selNetwork,
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
                                <li v-if="selNetwork === endpointKey.SHIBUYA">
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
                          :class="selNetwork === endpointKey.LOCAL && 'border--active'"
                          @click="setSelNetwork(endpointKey.LOCAL)"
                        >
                          <span class="text--network">Local Network</span>
                        </button>
                        <button
                          class="box--endpoints box--hover--active"
                          :class="selNetwork === endpointKey.CUSTOM && 'border--active'"
                          @click="setSelNetwork(endpointKey.CUSTOM)"
                        >
                          <span class="text--network">Custom Network</span>
                        </button>
                      </div>
                      <div v-if="selNetwork === endpointKey.CUSTOM">
                        <input
                          v-model="customEndpoint"
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
            <astar-button class="button--action" :disabled="isDisabled" @click="setIsNetwork(false)"
              >Next</astar-button
            >
          </div>
          <div v-if="!isNetwork">
            <div v-if="modalAccountSelect">
              <select-account
                :selected-wallet="(selectedWallet as SupportWallet)"
                :connect-ethereum-wallet="connectEthereumWallet"
                :disconnect-account="disconnectAccount"
                :current-account="currentAccount"
                :set-modal-account-select="setModalAccountSelect"
                :select-network="selectNetwork"
                :is-network-change="isNetworkChange"
              />
            </div>
            <select-wallet
              v-else
              :set-wallet-modal="setWalletModal"
              :connect-ethereum-wallet="connectEthereumWallet"
              :open-polkasafe-modal="openPolkasafeModal"
              :is-no-extension="
                modalName === WalletModalOption.NoExtension ||
                modalName === WalletModalOption.OutdatedWallet
              "
              :selected-wallet="(selectedWallet as SupportWallet)"
              :select-network="selectNetwork"
            />
          </div>
        </div>
        <div class="wrapper--ads">
          <span>Welcome to Astar Network</span>
        </div>
      </div>
    </div>
  </astar-modal-drawer>
</template>
<script lang="ts">
import { getRandomFromArray, wait } from '@astar-network/astar-sdk-core';
import {
  checkIsLightClient,
  checkIsSubstrateConnectInstalled,
} from 'src/config/api/polkadot/connectApi';
import { endpointKey, getNetworkName, providerEndpoints } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { buildNetworkUrl } from 'src/router/utils';
import { computed, defineComponent, ref, watch, watchEffect } from 'vue';
import NetworkWalletTab from './NetworkWalletTab.vue';
import SelectWallet from './SelectWallet.vue';
import SelectAccount from './SelectAccount.vue';
import { useConnectWallet } from 'src/hooks';
import { SupportWallet } from 'src/config/wallets';
import { WalletModalOption } from 'src/config/wallets';

export default defineComponent({
  components: { NetworkWalletTab, SelectWallet, SelectAccount },
  props: {
    isSelectWallet: {
      type: Boolean,
      required: true,
    },
    isOpen: {
      type: Boolean,
      required: true,
    },
    networkIdx: {
      type: Number,
      required: true,
    },
  },
  emits: ['update:is-open'],
  setup(props, { emit }) {
    const isExpand = ref<boolean>(false);

    // Ref: https://stackoverflow.com/questions/48143381/css-expand-contract-animation-to-show-hide-content
    const expandNetwork = async (isOpen: boolean): Promise<void> => {
      isExpand.value = !isOpen;
      const el = document.getElementById(isOpen ? 'network-expand' : 'network-expand-close');
      el && el.classList.toggle('network-expanded');
      el && el.classList.toggle('network-collapsed');
    };

    const isLightClientExtension = computed<boolean>(() => checkIsSubstrateConnectInstalled());

    const setInitialCustomEndpoint = (): string => {
      const selectedEndpointStored = String(localStorage.getItem(LOCAL_STORAGE.SELECTED_ENDPOINT));
      const selectedEndpoint = JSON.parse(selectedEndpointStored);
      const networkId = Object.keys(selectedEndpoint)[0];
      const connectedCustomEndpoint = Object.values(selectedEndpoint)[0] as string;
      return networkId === String(endpointKey.CUSTOM) ? connectedCustomEndpoint : '';
    };

    const customEndpoint = ref<string>(setInitialCustomEndpoint());
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

    const isNetworkChange = computed<boolean>(() => selNetwork.value !== props.networkIdx);

    const selectNetwork = async (): Promise<void> => {
      const networkIdxRef = selNetwork.value;
      if (isNetworkChange.value) {
        localStorage.setItem(NETWORK_IDX, networkIdxRef.toString());
        localStorage.setItem(
          SELECTED_ENDPOINT,
          JSON.stringify({
            [networkIdxRef]:
              customEndpoint.value && selNetwork.value === endpointKey.CUSTOM
                ? customEndpoint.value
                : getSelectedNetwork(networkIdxRef),
          })
        );
        const network = providerEndpoints[networkIdxRef].networkAlias;
        const url = buildNetworkUrl(network);
        window.open(url, '_self');
      } else {
        await closeModal();
      }
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
        return selNetwork.value === endpointKey.CUSTOM && !customEndpoint.value;
      }
    });

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

    const setSelNetwork = (networkId: number) => {
      selNetwork.value = networkId;
    };

    const setSelEndpoint = ({
      endpointObj,
      networkIdx,
    }: {
      endpointObj: { name: string; endpoint: string };
      networkIdx: number;
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

    const isNetwork = ref<boolean>(!props.isSelectWallet);
    const setIsNetwork = (result: boolean): void => {
      isNetwork.value = result;
    };

    const isZkEvm = computed<boolean>(
      () => selNetwork.value === endpointKey.ASTAR_ZKEVM || selNetwork.value === endpointKey.ZKATANA
    );

    const {
      modalConnectWallet,
      modalName,
      currentAccount,
      selectedWallet,
      modalAccountSelect,
      modalPolkasafeSelect,
      modalAccountUnificationSelect,
      setCloseModal,
      setWalletModal,
      openSelectModal,
      changeAccount,
      connectEthereumWallet,
      disconnectAccount,
      openPolkasafeModal,
      openAccountUnificationModal,
      setModalAccountSelect,
    } = useConnectWallet();

    watchEffect(() => {});

    return {
      isClosing,
      closeModal,
      isNetwork,
      setIsNetwork,
      expandNetwork,
      isExpand,
      selNetwork,
      setSelNetwork,
      checkIsCheckedEndpoint,
      customEndpoint,
      selectNetwork,
      setSelEndpoint,
      providerEndpoints,
      endpointKey,
      isSelectLightClient,
      isLightClientExtension,
      getNetworkName,
      isZkEvm,
      isDisabled,
      selectedWallet,
      SupportWallet,
      modalName,
      WalletModalOption,
      modalAccountSelect,
      setWalletModal,
      connectEthereumWallet,
      disconnectAccount,
      currentAccount,
      setModalAccountSelect,
      openPolkasafeModal,
      isNetworkChange,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/header/styles/modal-network-wallet.scss';
</style>
