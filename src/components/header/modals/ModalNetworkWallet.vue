<template>
  <astar-modal-drawer :show="isOpen" :is-closing="isClosing" @close="closeModal">
    <div class="wrapper--modal-network-tab">
      <div class="row--tab">
        <network-wallet-tab :is-network="isNetwork" :set-is-network="setIsNetwork" />
      </div>
      <div class="container--network-ads">
        <div class="box--networks">
          <div v-if="isNetwork">
            <select-network
              :sel-network-id="selNetworkId"
              :select-network="selectNetwork"
              :set-sel-network="setSelNetwork"
              :set-sel-endpoint="setSelEndpoint"
              :set-custom-endpoint="setCustomEndpoint"
              :set-is-network="setIsNetwork"
              :check-is-checked-endpoint="checkIsCheckedEndpoint"
              :is-zk-evm="isZkEvm"
              :is-select-light-client="isSelectLightClient"
              :is-light-client-extension="isLightClientExtension"
              :is-disabled="isDisabled"
            />
          </div>
          <div v-else>
            <div v-if="modalAccountSelect">
              <select-account
                :selected-wallet="(selectedWallet as SupportWallet)"
                :disconnect-account="disconnectAccount"
                :current-account="currentAccount"
                :set-modal-account-select="setModalAccountSelect"
                :select-network="selectNetwork"
              />
            </div>
            <div v-else-if="modalPolkasafeSelect">
              <select-multisig-account
                :selected-wallet="(selectedWallet as SupportWallet)"
                :disconnect-account="disconnectAccount"
                :current-account="currentAccount"
                :set-modal-account-select="setModalAccountSelect"
                :select-network="selectNetwork"
                :set-modal-polkasafe-select="setModalPolkasafeSelect"
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
              :sel-network-id="selNetworkId"
              :is-zk-evm="isZkEvm"
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
import SelectMultisigAccount from './SelectMultisigAccount.vue';
import SelectNetwork from './SelectNetwork.vue';
import { useConnectWallet } from 'src/hooks';
import { SupportWallet } from 'src/config/wallets';
import { WalletModalOption } from 'src/config/wallets';

export default defineComponent({
  components: {
    NetworkWalletTab,
    SelectWallet,
    SelectAccount,
    SelectMultisigAccount,
    SelectNetwork,
  },
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
    const {
      // modalConnectWallet,
      // modalAccountUnificationSelect,
      // setCloseModal,
      // openSelectModal,
      // changeAccount,
      // openAccountUnificationModal,
      modalName,
      currentAccount,
      selectedWallet,
      modalAccountSelect,
      modalPolkasafeSelect,
      isH160,
      setWalletModal,
      connectEthereumWallet,
      disconnectAccount,
      openPolkasafeModal,
      setModalAccountSelect,
      setModalPolkasafeSelect,
    } = useConnectWallet();

    const selNetworkId = ref<number>(props.networkIdx);
    const isNetwork = ref<boolean>(!props.isSelectWallet);
    const setIsNetwork = (result: boolean): void => {
      isNetwork.value = result;
    };

    const isZkEvm = computed<boolean>(
      () =>
        selNetworkId.value === endpointKey.ASTAR_ZKEVM || selNetworkId.value === endpointKey.ZKATANA
    );

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

    const setCustomEndpoint = (event: any): void => {
      customEndpoint.value = event.target.value;
    };

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

    const getNewEndpoint = () => {
      const networkIdxRef = selNetworkId.value;
      const selectedEndpointStored = String(localStorage.getItem(LOCAL_STORAGE.SELECTED_ENDPOINT));
      const selectedEndpoint = JSON.parse(selectedEndpointStored);
      const currentEndpoint = Object.values(selectedEndpoint)[0];

      const newEndpoint =
        customEndpoint.value && selNetworkId.value === endpointKey.CUSTOM
          ? customEndpoint.value
          : getSelectedNetwork(networkIdxRef);

      const isEndpointChange = currentEndpoint !== newEndpoint;
      return { isEndpointChange, newEndpoint };
    };

    const selectNetwork = async (): Promise<void> => {
      const networkIdxRef = selNetworkId.value;
      const { isEndpointChange, newEndpoint } = getNewEndpoint();
      if (isEndpointChange) {
        localStorage.setItem(NETWORK_IDX, networkIdxRef.toString());
        localStorage.setItem(
          SELECTED_ENDPOINT,
          JSON.stringify({
            [networkIdxRef]: newEndpoint,
          })
        );
        const network = providerEndpoints[networkIdxRef].networkAlias;
        const url = buildNetworkUrl(network);
        // Memo: Wait for 1 second for updating local storage, otherwise local storage items such as 'selectedAddress' will be removed
        await wait(1000);
        window.open(url, '_self');
      } else {
        await closeModal();
      }
    };

    const setInitialSelEndpoint = (): string => {
      return JSON.parse(localStorage.getItem(SELECTED_ENDPOINT) || '{}')[props.networkIdx] || '';
    };

    const selEndpointAstar = ref<string>('');
    const selEndpointShiden = ref<string>('');
    const selEndpointShibuya = ref<string>('');
    const selEndpointAstarZkevm = ref<string>('');
    const selEndpointZkatana = ref<string>('');

    const isDisabled = computed<boolean>(() => {
      const { isEndpointChange } = getNewEndpoint();
      if (!isEndpointChange) {
        return true;
      }
      if (isSelectLightClient.value) {
        return !isLightClientExtension.value;
      }
      if (selNetworkId.value === endpointKey.CUSTOM && !customEndpoint.value) {
        return true;
      }
      if (isZkEvm.value && !isH160.value) {
        return true;
      }

      return false;
    });

    const isSelectLightClient = computed<boolean>(() => {
      switch (selNetworkId.value) {
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
      selNetworkId.value = networkId;
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
      [selNetworkId],
      () => {
        setupInitialEndpointOption(props.networkIdx);
      },
      { immediate: true }
    );

    watchEffect(() => {
      // console.log('modalName', modalName.value);
    });

    return {
      isClosing,
      closeModal,
      isNetwork,
      setIsNetwork,
      setCustomEndpoint,
      selNetworkId,
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
      setModalPolkasafeSelect,
      modalPolkasafeSelect,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/header/styles/modal-network-wallet.scss';
</style>
