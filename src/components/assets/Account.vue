<template>
  <div class="wrapper--account">
    <div class="row--account-rewards">
      <div class="container--account" :class="`network-${currentNetworkIdx}`">
        <div class="account-bg" :style="{ backgroundImage: `url(${bg})` }" />

        <div class="wallet-tab">
          <div v-if="isLockdropAccount && isAllowLockdropDispatch" class="row--lockdrop">
            <span>{{ $t('assets.lockdropAccount') }}</span>
            <span class="text--switch-account" @click="toggleEvmWalletSchema">
              {{ $t(isH160 ? 'assets.switchToNative' : 'assets.switchToEvm') }}
            </span>
          </div>
          <div v-else />
          <div class="wallet-tab__bg">
            <!-- EVM -->
            <template v-if="isH160">
              <!-- zkEVM -->
              <template v-if="isZkEvm">
                <a class="btn" href="/shibuya-testnet/assets"> Shibuya EVM (L1) </a>
                <div v-if="isZkEvm" class="btn active">Astar zKatana</div>
              </template>

              <!-- Astar EVM -->
              <template v-else>
                <div class="btn active">
                  {{ currentNetworkName.replace('Network', '') }}
                  EVM (L1)
                </div>
                <a v-if="currentNetworkIdx === 2" class="btn" href="/zkatana-testnet/assets">
                  Astar zKatana
                </a>
                <a v-else-if="currentNetworkIdx !== 1" class="btn" disabled>Astar zkEVM</a>
              </template>
            </template>

            <!-- Native -->
            <div v-else class="btn active">
              {{ currentNetworkIdx === 4 ? 'Astar' : currentNetworkName.replace('Network', '') }}
              {{ $t('native') }}
            </div>
          </div>
        </div>

        <div class="row">
          <div class="row--account-info">
            <div class="column--account-icon">
              <au-icon
                v-if="isAccountUnified"
                :native-address="unifiedAccount?.nativeAddress"
                :icon-url="unifiedAccount?.avatarUrl"
              />
              <img
                v-else-if="iconWallet"
                width="24"
                :src="iconWallet"
                alt="wallet-icon"
                :class="multisig && 'img--polkasafe'"
              />
            </div>

            <div>
              <div class="text--address">
                <span>{{ getShortenAddress(currentAccount) }}</span>
              </div>
              <div class="text--balance">
                {{ $n(totalBal) }}
                <span>{{ $t('usd') }}</span>
              </div>
            </div>
          </div>

          <div class="row--actions">
            <div v-if="isAccountUnification">
              <button type="button" class="btn--icon" @click="showAccountUnificationModal()">
                <astar-icon-person />
              </button>
              <q-tooltip>
                <span class="text--tooltip">{{ $t('assets.unifyAccounts') }}</span>
              </q-tooltip>
            </div>

            <div>
              <button id="copyAddress" type="button" class="btn--icon" @click="copyAddress">
                <astar-icon-copy class="icon--copy" />
              </button>
              <q-tooltip>
                <span class="text--tooltip">{{ $t('copy') }}</span>
              </q-tooltip>
            </div>

            <a :href="isH160 ? blockscout : subScan" target="_blank" rel="noopener noreferrer">
              <button class="btn--icon">
                <astar-icon-external-link class="icon--external-link" />
              </button>
              <q-tooltip>
                <span class="text--tooltip">{{ $t(isH160 ? 'blockscout' : 'subscan') }}</span>
              </q-tooltip>
            </a>
          </div>
        </div>
        <div v-if="isWalletConnect" class="row--wc-warning">
          <span class="text--warning">
            {{
              $t('assets.verifyWalletCompatibility', {
                network: currentNetworkName.replace('Network', ''),
              })
            }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="multisig" class="row--details-signatory">
      <div class="column-account-name">
        <img v-if="iconWallet" width="24" :src="signatoryIconWallet" alt="wallet-icon" />
        <span class="text--accent">{{
          $t('assets.theSignatory', { account: multisig.signatory.name })
        }}</span>
      </div>
    </div>
    <modal-lockdrop-warning
      v-if="isLockdropAccount && !isH160"
      :is-modal="isModalLockdropWarning"
      :handle-modal="handleModalLockdropWarning"
    />
  </div>
</template>
<script lang="ts">
import { getShortenAddress, isValidEvmAddress } from '@astar-network/astar-sdk-core';
import { FrameSystemAccountInfo } from '@polkadot/types/lookup';
import copy from 'copy-to-clipboard';
import { ethers } from 'ethers';
import { $api } from 'src/boot/api';
import AuIcon from 'src/components/header/modals/account-unification/AuIcon.vue';
import { endpointKey, providerEndpoints } from 'src/config/chainEndpoints';
import { SupportWallet, supportWalletObj } from 'src/config/wallets';
import {
  ETHEREUM_EXTENSION,
  useAccount,
  useBalance,
  useNetworkInfo,
  usePrice,
  useWalletIcon,
  useAccountUnification,
  useConnectWallet,
} from 'src/hooks';
import { useEvmAccount } from 'src/hooks/custom-signature/useEvmAccount';
import { getEvmMappedSs58Address, setAddressMapping } from 'src/hooks/helper/addressUtils';
import { useStore } from 'src/store';
import { computed, defineComponent, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import ModalLockdropWarning from 'src/components/assets/modals/ModalLockdropWarning.vue';

export default defineComponent({
  components: {
    AuIcon,
    ModalLockdropWarning,
  },
  props: {
    ttlErc20Amount: {
      type: Number,
      required: true,
    },
    ttlNativeXcmUsdAmount: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const balUsd = ref<number | null>(null);
    const isCheckingSignature = ref<boolean>(false);
    const isLockdropAccount = ref<boolean>(false);
    const isModalLockdropWarning = ref<boolean>(true);

    const {
      currentAccount,
      currentAccountName,
      multisig,
      showAccountUnificationModal,
      isAccountUnification,
    } = useAccount();

    const { toggleEvmWalletSchema } = useConnectWallet();
    const { balance, isLoadingBalance } = useBalance(currentAccount);
    const { nativeTokenUsd } = usePrice();
    const { requestSignature } = useEvmAccount();
    const { iconWallet } = useWalletIcon();
    const { unifiedAccount, isAccountUnified } = useAccountUnification();

    const store = useStore();
    const { t } = useI18n();
    const isDarkTheme = computed<boolean>(() => store.getters['general/theme'] === 'DARK');

    const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
    const isEthWallet = computed<boolean>(() => store.getters['general/isEthWallet']);

    const { currentNetworkIdx, isZkEvm, isAllowLockdropDispatch } = useNetworkInfo();

    const isWalletConnect = computed<boolean>(() => {
      const currentWallet = store.getters['general/currentWallet'];
      return currentWallet === SupportWallet.WalletConnect;
    });

    const blockscout = computed<string>(
      () =>
        `${providerEndpoints[currentNetworkIdx.value].blockscout}/address/${currentAccount.value}`
    );
    const subScan = computed<string>(
      () => `${providerEndpoints[currentNetworkIdx.value].subscan}/account/${currentAccount.value}`
    );

    const totalBal = computed<number>(
      () => Number(balUsd.value) + props.ttlErc20Amount + props.ttlNativeXcmUsdAmount
    );

    const signatoryIconWallet = computed<string>(() => {
      // @ts-ignore
      return multisig.value ? supportWalletObj[multisig.value.signatory.source].img : '';
    });

    const copyAddress = () => {
      copy(currentAccount.value);
      store.dispatch('general/showAlertMsg', {
        msg: t('toast.copyAddressSuccessfully'),
        alertType: 'copied',
      });
    };

    const isSkeleton = computed<boolean>(() => {
      if (!nativeTokenUsd.value) return false;
      return isLoadingBalance.value;
    });

    const handleModalLockdropWarning = ({ isOpen }: { isOpen: boolean }) => {
      isModalLockdropWarning.value = isOpen;
    };

    watch(
      [balance, nativeTokenUsd, currentAccount, isH160],
      () => {
        balUsd.value = null;
        const isEvmShiden = currentNetworkIdx.value === endpointKey.SHIDEN && isH160.value;
        if (!balance.value || !nativeTokenUsd.value) return;
        if (isEvmShiden) {
          // Memo: get the value from cbridge hooks
          balUsd.value = 0;
          return;
        }

        const bal = Number(ethers.utils.formatEther(balance.value.toString()));
        balUsd.value = nativeTokenUsd.value * bal;
      },
      { immediate: true }
    );

    watchEffect(async () => {
      try {
        if (!isH160.value || !isValidEvmAddress(currentAccount.value)) return;
        isCheckingSignature.value = true;
        await setAddressMapping({ evmAddress: currentAccount.value, requestSignature });
      } catch (error: any) {
        console.error(error.message);
      } finally {
        isCheckingSignature.value = false;
      }
    });

    watch(
      [isH160, isCheckingSignature, isEthWallet],
      async () => {
        const apiRef = $api;
        if (!isEthWallet.value) {
          isLockdropAccount.value = false;

          return;
        }
        if (
          !apiRef ||
          !currentAccount.value ||
          !isValidEvmAddress(currentAccount.value) ||
          isCheckingSignature.value
        ) {
          return;
        }
        try {
          const ss58 = getEvmMappedSs58Address(currentAccount.value);
          if (!ss58) return;
          const { data } = await apiRef.query.system.account<FrameSystemAccountInfo>(ss58);
          if (Number(data.free.toString()) > 0) {
            isLockdropAccount.value = true;
          } else {
            isLockdropAccount.value = false;
          }
        } catch (error: any) {
          console.error(error.message);
          isLockdropAccount.value = false;
        }
      },
      { immediate: false }
    );

    const bg_img = {
      native: require('/src/assets/img/account_bg_native.webp'),
      shiden: require('/src/assets/img/account_bg_shiden.webp'),
      testnet: require('/src/assets/img/account_bg_testnet.webp'),
      zk: require('/src/assets/img/account_bg_zk.webp'),
      testnet_zk: require('/src/assets/img/account_bg_testnet_zk.webp'),
    };

    const bg = computed<String>(() => {
      if (currentNetworkIdx.value === endpointKey.ASTAR) {
        return bg_img.native;
      } else if (currentNetworkIdx.value === endpointKey.SHIDEN) {
        return bg_img.shiden;
      } else if (currentNetworkIdx.value === endpointKey.ZKATANA) {
        return bg_img.testnet_zk;
      }
      return bg_img.testnet;
    });

    const currentNetworkName = ref<string>(providerEndpoints[currentNetworkIdx.value].displayName);

    return {
      iconWallet,
      currentAccountName,
      currentAccount,
      blockscout,
      subScan,
      isDarkTheme,
      isH160,
      isEthWallet,
      balUsd,
      isSkeleton,
      totalBal,
      ETHEREUM_EXTENSION,
      multisig,
      supportWalletObj,
      signatoryIconWallet,
      isAccountUnification,
      unifiedAccount,
      isAccountUnified,
      isZkEvm,
      bg,
      currentNetworkIdx,
      currentNetworkName,
      isLockdropAccount,
      isModalLockdropWarning,
      isAllowLockdropDispatch,
      isWalletConnect,
      handleModalLockdropWarning,
      getShortenAddress,
      copyAddress,
      showAccountUnificationModal,
      toggleEvmWalletSchema,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/account.scss';
</style>
