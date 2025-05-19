<template>
  <div data-testid="evm-native-token">
    <div class="row row--transferable row--transferable-evm">
      <div class="row__info">
        <div class="column--token-name">
          <img class="token-logo" :src="nativeTokenImg" :alt="nativeTokenSymbol" />
          <template v-if="nativeTokenSymbol">
            <span class="text--title">{{ nativeTokenSymbol }}</span>
          </template>
          <template v-else>
            <q-skeleton animation="fade" class="skeleton--md" />
          </template>
        </div>
        <div class="column--balance-evm">
          <div class="column--balance__row text--title">
            <div class="column--amount">
              {{ $n(truncate(Number(bal), 3)) }}
            </div>
            <div class="column--symbol">
              {{ nativeTokenSymbol }}
            </div>
          </div>

          <div class="column--balance__row text--label">
            <div class="column--amount">
              {{ $n(truncate(Number(balUsd), 3)) }}
            </div>
            <div class="column--symbol">
              {{ $t('usd') }}
            </div>
          </div>
        </div>
      </div>

      <div class="row__actions-evm">
        <router-link :to="buildTransferPageLink(nativeTokenSymbol)">
          <button class="btn btn--icon">
            <astar-icon-transfer />
          </button>
          <span class="text--mobile-menu">{{ $t('assets.send') }}</span>
          <q-tooltip>
            <span class="text--tooltip">{{ $t('assets.send') }}</span>
          </q-tooltip>
        </router-link>

        <div class="box--ccip">
          <custom-router-link
            v-if="isShibuyaEvm || isAstarEvm"
            :to="ccipSoneiumLink"
            :is-disabled="!isEnableSoneiumCcipBridge"
          >
            <button
              v-if="width >= screenSize.sm"
              class="btn btn--icon"
              @mouseover="isSoneiumButtonHover = true"
              @mouseleave="isSoneiumButtonHover = false"
            >
              <img
                class="img--logo-soneium"
                :src="
                  isSoneiumButtonHover
                    ? require('src/assets/img/chain/soneium-white.svg')
                    : require('src/assets/img/chain/soneium-blue.svg')
                "
                alt="soneium"
              />
            </button>
            <button v-else class="btn btn--icon">
              <img
                class="img--logo-soneium"
                :src="require('src/assets/img/chain/soneium-white.svg')"
                alt="soneium"
              />
            </button>
            <span class="text--mobile-menu">{{ $t('assets.bridgeToSoneium') }}</span>
            <q-tooltip>
              <span class="text--tooltip">{{ $t('assets.bridgeToSoneium') }}</span>
            </q-tooltip>
          </custom-router-link>
        </div>

        <div class="box--ccip">
          <custom-router-link
            v-if="isShibuyaEvm || isAstarEvm"
            :to="ccipEthereumLink"
            :is-disabled="!isEnableEthereumCcipBridge"
          >
            <button
              v-if="width >= screenSize.sm"
              class="btn btn--icon"
              @mouseover="isEthereumButtonHover = true"
              @mouseleave="isEthereumButtonHover = false"
            >
              <img
                class="img--logo-soneium"
                :src="
                  isEthereumButtonHover
                    ? require('src/assets/img/chain/ethereum-white.svg')
                    : require('src/assets/img/chain/ethereum-blue.svg')
                "
                alt="ethereum"
              />
            </button>
            <button v-else class="btn btn--icon">
              <img
                class="img--logo-soneium"
                :src="require('src/assets/img/chain/ethereum-white.svg')"
                alt="ethereum"
              />
            </button>
            <span class="text--mobile-menu">{{ $t('assets.bridgeToEthereum') }}</span>
            <q-tooltip>
              <span class="text--tooltip">{{ $t('assets.bridgeToEthereum') }}</span>
            </q-tooltip>
          </custom-router-link>
          <balloon
            class="balloon--ccip"
            direction="top"
            :is-balloon="isCcipEthereumBalloon"
            :is-balloon-closing="isBalloonClosing"
            :handle-close-balloon="closeCcipEthereumBalloon"
            :text="$t('assets.bridgeToEthereum')"
            :title="$t('new')"
          />
        </div>

        <!-- Only SDN is able to bridge via cBridge at this moment -->
        <!-- <a
          v-if="nativeTokenSymbol === 'SDN'"
          :href="cbridgeAppLink"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button class="btn btn--icon">
            <astar-icon-bridge />
          </button>
          <span class="text--mobile-menu">{{ $t('assets.bridge') }}</span>
          <q-tooltip>
            <span class="text--tooltip">{{ $t('assets.bridge') }}</span>
          </q-tooltip>
        </a> -->
        <a v-if="nativeTokenSymbol === 'SDN'">
          <button class="btn btn--icon" disabled>
            <astar-icon-bridge />
          </button>
          <span class="text--mobile-menu">{{ $t('assets.bridge') }}</span>
          <q-tooltip>
            <span class="text--tooltip">{{ $t('assets.bridge') }}</span>
          </q-tooltip>
        </a>

        <div v-else-if="isFaucet">
          <button class="btn btn--icon" @click="handleModalFaucet({ isOpen: true })">
            <astar-icon-faucet />
          </button>
          <span class="text--mobile-menu">{{ $t('assets.faucet') }}</span>
          <q-tooltip>
            <span class="text--tooltip">{{ $t('assets.faucet') }}</span>
          </q-tooltip>
        </div>
      </div>
    </div>

    <modal-faucet :is-modal-faucet="isModalFaucet" :handle-modal-faucet="handleModalFaucet" />
  </div>
</template>
<script lang="ts">
import { truncate, wait } from '@astar-network/astar-sdk-core';
import { ethers } from 'ethers';
import { $web3 } from 'src/boot/api';
import { cbridgeAppLink } from 'src/c-bridge';
import ModalFaucet from 'src/components/assets/modals/ModalFaucet.vue';
import Balloon from 'src/components/common/Balloon.vue';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import {
  layerZeroBridgeEnabled,
  nativeBridgeEnabled,
  checkIsCcipBridgeEnabled,
} from 'src/features';
import { useAccount, useBreakpoints, useFaucet, useNetworkInfo } from 'src/hooks';
import { faucetSethLink } from 'src/links';
import { getTokenImage } from 'src/modules/token';
import {
  buildEthereumBridgePageLink,
  buildLzBridgePageLink,
  buildTransferPageLink,
} from 'src/router/routes';
import { useStore } from 'src/store';
import { computed, defineComponent, ref, watch, watchEffect } from 'vue';

import CustomRouterLink from '../common/CustomRouterLink.vue';
import { CcipNetworkName } from 'src/modules/ccip-bridge';

export default defineComponent({
  components: { ModalFaucet, CustomRouterLink, Balloon },
  props: {
    nativeTokenUsd: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  setup(props) {
    const bal = ref<number>(0);
    const balUsd = ref<number>(0);
    const isShibuya = ref<boolean>(false);
    const isRocstar = ref<boolean>(false);
    const isFaucet = ref<boolean>(false);
    const isModalFaucet = ref<boolean>(false);

    const isCcipSoneiumBalloon = ref<boolean>(false);
    const isCcipEthereumBalloon = ref<boolean>(false);
    const isBalloonClosing = ref<boolean>(false);
    const isSoneiumButtonHover = ref<boolean>(false);
    const isEthereumButtonHover = ref<boolean>(false);

    const {
      currentNetworkName,
      nativeTokenSymbol,
      isAstar,
      isShibuyaEvm,
      isAstarEvm,
      ccipSoneiumLink,
      ccipEthereumLink,
    } = useNetworkInfo();

    const closeCcipSoneiumBalloon = () => {
      isCcipSoneiumBalloon.value = false;
    };

    const closeCcipEthereumBalloon = () => {
      isCcipEthereumBalloon.value = false;
    };

    const { currentAccount } = useAccount();
    const store = useStore();
    const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
    const isLoading = computed<boolean>(() => store.getters['general/isLoading']);
    const { faucetBalRequirement } = useFaucet();

    const nativeTokenImg = computed<string>(() =>
      getTokenImage({
        isNativeToken: true,
        symbol: nativeTokenSymbol.value,
      })
    );

    const updateStates = async (nativeTokenUsd: number): Promise<void> => {
      if (isLoading.value || !nativeTokenSymbol.value || !isH160.value || !$web3.value) return;
      try {
        const balWei = await $web3.value!.eth.getBalance(currentAccount.value);
        bal.value = Number(ethers.utils.formatEther(balWei));
        isShibuya.value = nativeTokenSymbol.value === 'SBY';
        isRocstar.value = nativeTokenSymbol.value === 'RSTR';
        isFaucet.value = isRocstar.value
          ? false
          : isShibuya.value || faucetBalRequirement.value > bal.value;
        if (nativeTokenUsd) {
          balUsd.value = nativeTokenUsd * bal.value;
        }
      } catch (error: any) {
        console.error(error.message);
      }
    };

    watchEffect(async () => {
      await updateStates(props.nativeTokenUsd);
    });

    const handleModalFaucet = ({ isOpen }: { isOpen: boolean }): void => {
      isModalFaucet.value = isOpen;
    };

    const { width, screenSize } = useBreakpoints();

    const isTruncate = !nativeTokenSymbol.value.toUpperCase().includes('BTC');

    const isEnableSoneiumCcipBridge = computed<boolean>(() => {
      const from = isShibuyaEvm.value ? CcipNetworkName.ShibuyaEvm : CcipNetworkName.AstarEvm;
      const to = isShibuyaEvm.value ? CcipNetworkName.SoneiumMinato : CcipNetworkName.Soneium;
      return checkIsCcipBridgeEnabled({ from, to });
    });

    const isEnableEthereumCcipBridge = computed<boolean>(() => {
      const from = isShibuyaEvm.value ? CcipNetworkName.ShibuyaEvm : CcipNetworkName.AstarEvm;
      const to = isShibuyaEvm.value ? CcipNetworkName.Sepolia : CcipNetworkName.Ethereum;
      return checkIsCcipBridgeEnabled({ from, to });
    });

    // Memo: display the balloon animation
    watch(
      [isShibuyaEvm, isAstarEvm],
      async () => {
        const isBallonSepoliaCcipDisplayed = Boolean(
          localStorage.getItem(LOCAL_STORAGE.BALLOON_CCIP_SEPOLIA)
        );
        const isBallonEthreumCcipDisplayed = Boolean(
          localStorage.getItem(LOCAL_STORAGE.BALLOON_CCIP_ETHEREUM)
        );

        if (isShibuyaEvm.value && !isBallonSepoliaCcipDisplayed) {
          await wait(1000);
          isCcipEthereumBalloon.value = true;
          localStorage.setItem(LOCAL_STORAGE.BALLOON_CCIP_SEPOLIA, 'true');
        }

        if (isAstarEvm.value && !isBallonEthreumCcipDisplayed) {
          await wait(1000);
          isCcipEthereumBalloon.value = true;
          localStorage.setItem(LOCAL_STORAGE.BALLOON_CCIP_ETHEREUM, 'true');
        }
      },
      { immediate: true }
    );

    return {
      nativeTokenImg,
      nativeTokenSymbol,
      currentNetworkName,
      bal,
      balUsd,
      cbridgeAppLink,
      isFaucet,
      isModalFaucet,
      faucetSethLink,
      width,
      screenSize,
      isTruncate,
      isAstar,
      nativeBridgeEnabled,
      layerZeroBridgeEnabled,
      isShibuyaEvm,
      isEnableSoneiumCcipBridge,
      isEnableEthereumCcipBridge,
      isCcipSoneiumBalloon,
      isBalloonClosing,
      isAstarEvm,
      isSoneiumButtonHover,
      isEthereumButtonHover,
      ccipSoneiumLink,
      ccipEthereumLink,
      isCcipEthereumBalloon,
      closeCcipEthereumBalloon,
      closeCcipSoneiumBalloon,
      truncate,
      handleModalFaucet,
      buildTransferPageLink,
      buildEthereumBridgePageLink,
      buildLzBridgePageLink,
      checkIsCcipBridgeEnabled,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list.scss';
</style>
