<template>
  <astar-modal-drawer
    :show="isModalConnectWallet"
    :is-closing="isClosing"
    title="Select a Wallet"
    @close="closeModal()"
  >
    <div class="wrapper--modal--wallet">
      <div>
        <div class="title--account-type">
          <span>
            {{ $t('wallet.evmAccount') }}
          </span>
        </div>
        <div class="wrapper--wallets">
          <div
            v-for="(wallet, index) in evmWallets"
            :key="index"
            class="box__row--wallet box--hover--active"
            :class="currentWallet === wallet.source && 'border--active'"
            :wallet="wallet"
            @click="setEvmWalletModal(wallet.source)"
          >
            <div class="box--img">
              <img :src="wallet.img" />
            </div>
            <div>
              <span>
                {{ castWalletName(wallet.name) }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div class="title--account-type">
          <span>
            {{ $t('wallet.nativeAccount') }}
          </span>
        </div>
        <div class="wrapper--wallets">
          <div
            v-for="(wallet, index) in nativeWallets"
            :key="index"
            class="box__row--wallet box--hover--active"
            :class="currentWallet === wallet.source && 'border--active'"
            @click="setSubstrateWalletModal(wallet.source)"
          >
            <div class="box--img">
              <img :src="wallet.img" />
            </div>
            <div>
              <span>
                {{ castWalletName(wallet.name) }}
              </span>
            </div>
          </div>
        </div>
        <div v-if="selWallet && isNoExtension" class="box--no-extension">
          <div class="title--no-extension">
            <span class="text--install-title">
              {{ $t('installWallet.getWallet', { value: $t(selWallet.name) }) }}
            </span>
          </div>
          <div class="row--no-extension">
            <span class="text--install">
              {{ $t('installWallet.installWallet', { value: $t(selWallet.name) }) }}</span
            >
          </div>
          <div class="row--icon-links">
            <button>
              <a
                :href="selWallet.walletUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="button--link"
              >
                <div class="icon--link">
                  <astar-icon-external-link />
                </div>
                <span class="text--install-link">
                  {{ $t('installWallet.install') }}
                </span>
              </a>
            </button>
            <button>
              <a
                :href="selWallet.guideUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="button--link"
              >
                <div class="icon--link">
                  <astar-icon-external-link />
                </div>
                <span class="text--install-link">
                  {{ $t('installWallet.learn') }}
                </span>
              </a>
            </button>
          </div>
        </div>
      </div>
      <div v-if="currentNetworkIdx === endpointKey.ASTAR">
        <div class="title--account-type">
          <span>
            {{ $t('wallet.multisigAccount') }}
          </span>
        </div>
        <div class="wrapper--wallets">
          <div
            class="box__row--wallet box--hover--active"
            :class="currentWallet === SupportMultisig.Polkasafe && 'border--active'"
            @click="setPolkasafeModal()"
          >
            <div class="box--img">
              <img
                :src="require('src/assets/img/logo-polkasafe-black.svg')"
                class="img--polkasafe"
              />
            </div>
            <div>
              <span> PolkaSafe </span>
            </div>
          </div>
        </div>
      </div>
      <button :disabled="!currentAccountName" class="btn--disconnect" @click="disconnectAccount()">
        {{ $t('disconnect') }}
      </button>
    </div>
  </astar-modal-drawer>
</template>
<script lang="ts">
import { wait } from '@astar-network/astar-sdk-core';
import { $api } from 'src/boot/api';
import {
  supportAllWalletsObj,
  supportEvmWallets,
  SupportWallet,
  supportWallets,
  Wallet,
  SupportMultisig,
} from 'src/config/wallets';
import { useAccount, useNetworkInfo } from 'src/hooks';
import { isMobileDevice } from 'src/hooks/helper/wallet';
import { useExtensions } from 'src/hooks/useExtensions';
import { useStore } from 'src/store';
import { computed, defineComponent, PropType, ref } from 'vue';
import { endpointKey } from 'src/config/chainEndpoints';
import { SubstrateAccount } from 'src/store/general/state';

export default defineComponent({
  props: {
    isModalConnectWallet: {
      type: Boolean,
      required: true,
    },
    setCloseModal: {
      type: Function,
      required: true,
    },
    setWalletModal: {
      type: Function,
      required: true,
    },
    connectEthereumWallet: {
      type: Function,
      required: true,
    },
    openPolkasafeModal: {
      type: Function,
      required: true,
    },
    isNoExtension: {
      type: Boolean,
      required: true,
    },
    selectedWallet: {
      type: String as PropType<SupportWallet>,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    const { currentAccountName, disconnectAccount } = useAccount();
    const isClosing = ref<boolean>(false);
    const { currentNetworkIdx } = useNetworkInfo();

    const closeModal = async (): Promise<void> => {
      isClosing.value = true;
      const animationDuration = 500;
      await wait(animationDuration);
      isClosing.value = false;
      props.setCloseModal();
    };

    const nativeWallets = computed(() => {
      return supportWallets
        .map((it) => {
          const { isSupportMobileApp, isSupportBrowserExtension } = it;
          if (isMobileDevice) {
            return isSupportMobileApp ? it : undefined;
          } else {
            return isSupportBrowserExtension ? it : undefined;
          }
        })
        .filter((it) => it !== undefined) as Wallet[];
    });

    const evmWallets = computed(() => {
      return supportEvmWallets
        .map((it) => {
          const { isSupportMobileApp, isSupportBrowserExtension } = it;
          if (isMobileDevice) {
            return isSupportMobileApp ? it : undefined;
          } else {
            return isSupportBrowserExtension ? it : undefined;
          }
        })
        .filter((it) => it !== undefined) as Wallet[];
    });

    const selWallet = computed(() => supportAllWalletsObj[props.selectedWallet]);
    const substrateAccounts = computed<SubstrateAccount[]>(
      () => store.getters['general/substrateAccounts']
    );

    const castWalletName = (wallet: string): string => {
      return wallet.split('(')[0].trim();
    };

    const handleExtensions = (): void => {
      if (substrateAccounts.value.length === 0) {
        useExtensions($api!!, store);
      }
    };

    const setSubstrateWalletModal = async (source: string): Promise<void> => {
      await closeModal();
      props.setWalletModal(source);
    };

    const setPolkasafeModal = async (): Promise<void> => {
      handleExtensions();
      await closeModal();
      props.openPolkasafeModal();
    };

    const setEvmWalletModal = async (source: string): Promise<void> => {
      await closeModal();
      props.connectEthereumWallet(source);
    };
    const currentWallet = computed<string>(() => store.getters['general/currentWallet']);

    return {
      nativeWallets,
      evmWallets,
      isClosing,
      currentWallet,
      currentAccountName,
      selWallet,
      SupportMultisig,
      castWalletName,
      closeModal,
      setSubstrateWalletModal,
      setEvmWalletModal,
      disconnectAccount,
      setPolkasafeModal,
      currentNetworkIdx,
      endpointKey,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/header/styles/modal-connect-wallet.scss';
</style>
