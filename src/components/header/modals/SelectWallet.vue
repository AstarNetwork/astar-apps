<template>
  <div
    class="animate__animated animate__fadeInRight"
    :class="isClosing && 'animate__animated animate__fadeOutLeft'"
  >
    <div class="wrapper--modal--wallet">
      <div>
        <div class="title--account-type">
          <span>
            {{ $t('wallet.evmWallets') }}
          </span>
        </div>
        <div class="wrapper--wallets">
          <button
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
          </button>
        </div>
      </div>
      <div>
        <div class="title--account-type">
          <span>
            {{ $t('wallet.nativeWallets') }}
          </span>
        </div>
        <div class="wrapper--wallets">
          <button
            v-for="(wallet, index) in nativeWallets"
            :key="index"
            :disabled="isZkEvm"
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
          </button>
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
          <button
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
          </button>
        </div>
      </div>

      <!-- <button :disabled="!currentAccountName" class="btn--disconnect" @click="disconnectAccount()">
        {{ $t('disconnect') }}
      </button> -->
    </div>
  </div>
</template>
<script lang="ts">
import { wait } from '@astar-network/astar-sdk-core';
import { initPolkadotSnap } from '@astar-network/metamask-astar-adapter';
import { get } from 'lodash-es';
import { $api } from 'src/boot/api';
import { endpointKey } from 'src/config/chainEndpoints';
import {
  SupportMultisig,
  SupportWallet,
  Wallet,
  supportAllWalletsObj,
  supportEvmWalletObj,
  supportEvmWallets,
  supportWallets,
} from 'src/config/wallets';
import { useAccount, useConnectWallet, useNetworkInfo } from 'src/hooks';
import { getInjectedExtensions, isMobileDevice } from 'src/hooks/helper/wallet';
import { useExtensions } from 'src/hooks/useExtensions';
import { initiatePolkdatodSnap } from 'src/modules/snap';
import { useStore } from 'src/store';
import { SubstrateAccount } from 'src/store/general/state';
import { PropType, computed, defineComponent, ref } from 'vue';

export default defineComponent({
  props: {
    setWalletModal: {
      type: Function,
      required: true,
    },
    // connectEthereumWallet: {
    //   type: Function,
    //   required: true,
    // },
    // openPolkasafeModal: {
    //   type: Function,
    //   required: true,
    // },
    // isNoExtension: {
    //   type: Boolean,
    //   required: true,
    // },
    selectedWallet: {
      type: String as PropType<SupportWallet>,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    const { currentAccountName, disconnectAccount, isAccountUnification } = useAccount();
    const { currentNetworkIdx, isZkEvm } = useNetworkInfo();
    const isClosing = ref<boolean>(false);
    const closeUi = async (): Promise<void> => {
      isClosing.value = true;
      const animationDuration = 500;
      await wait(animationDuration);
      isClosing.value = false;
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

    const selWallet = computed<Wallet>(
      () => supportAllWalletsObj[props.selectedWallet as SupportWallet]
    );

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

    const handleMetaMaskSnap = async (): Promise<void> => {
      const isSnapInstalled = await initiatePolkdatodSnap();
      if (isSnapInstalled) {
        await initPolkadotSnap();
        useExtensions($api!!, store);
        const extensions = await getInjectedExtensions(true);
        const isExtensionsUpdated = extensions.some((it) => it.name === SupportWallet.Snap);
        // Memo: Sync the metamask extension for users who visit our portal first time
        !isExtensionsUpdated && (await wait(3000));
      }
    };
    const setSubstrateWalletModal = async (source: string): Promise<void> => {
      if (source === SupportWallet.Snap) {
        await handleMetaMaskSnap();
      }
      await closeUi();
      props.setWalletModal(source);
    };

    const setPolkasafeModal = async (): Promise<void> => {
      handleExtensions();
      // await closeModal();
      // props.openPolkasafeModal();
    };

    const setEvmWalletModal = async (source: string): Promise<void> => {
      // await closeModal();
      // props.connectEthereumWallet(source);
    };

    const currentWallet = computed<string>(() => store.getters['general/currentWallet']);

    return {
      nativeWallets,
      evmWallets,
      currentWallet,
      currentAccountName,
      selWallet,
      SupportMultisig,
      castWalletName,
      setSubstrateWalletModal,
      setEvmWalletModal,
      disconnectAccount,
      setPolkasafeModal,
      currentNetworkIdx,
      endpointKey,
      isZkEvm,
      isAccountUnification,
      isClosing,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/header/styles/select-wallet.scss';
.animate__animated.animate__fadeInRight {
  --animate-duration: 0.8s;
}
.animate__animated.animate__fadeOutLeft {
  --animate-duration: 0.8s;
}
</style>
