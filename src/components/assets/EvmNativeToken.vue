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

      <div class="row__actions">
        <router-link :to="buildTransferPageLink(nativeTokenSymbol)">
          <button class="btn btn--icon">
            <astar-icon-transfer />
          </button>
          <span class="text--mobile-menu">{{ $t('assets.send') }}</span>
          <q-tooltip>
            <span class="text--tooltip">{{ $t('assets.send') }}</span>
          </q-tooltip>
        </router-link>

        <div
          class="box--ccip"
          @mouseover="isCcipBalloon = true"
          @mouseleave="isCcipBalloon = false"
        >
          <custom-router-link
            v-if="isShibuyaEvm"
            :to="buildCcipBridgePageLink()"
            :is-disabled="!ccipMinatoBridgeEnabled"
          >
            <button class="btn btn--icon">
              <img
                class="img--logo-soneium"
                :src="require('src/assets/img/chain/soneium-color.svg')"
                alt="soneium"
              />
            </button>
            <span class="text--mobile-menu">{{ $t('assets.bridgeToSoneium') }}</span>
            <!-- <q-tooltip>
              <span class="text--tooltip">{{ $t('assets.bridgeToSoneium') }}</span>
            </q-tooltip> -->
          </custom-router-link>
          <balloon
            class="balloon--ccip"
            direction="top"
            :is-balloon="isCcipBalloon"
            :is-balloon-closing="isBalloonClosing"
            :handle-close-balloon="closeCcipBalloon"
            :text="$t('assets.bridgeToSoneium')"
            :title="$t('new')"
          />
        </div>

        <custom-router-link
          v-if="isAstar"
          :to="buildLzBridgePageLink()"
          :is-disabled="!layerZeroBridgeEnabled"
        >
          <button class="btn btn--icon"><astar-icon-bridge /></button>
          <span class="text--mobile-menu">{{ $t('assets.bridge') }}</span>
          <q-tooltip>
            <span class="text--tooltip">{{ $t('assets.bridge') }}</span>
          </q-tooltip>
        </custom-router-link>

        <custom-router-link
          v-if="isZkEvm"
          :to="buildEthereumBridgePageLink()"
          :is-disabled="!nativeBridgeEnabled"
        >
          <button class="btn btn--icon"><astar-icon-bridge /></button>
          <span class="text--mobile-menu">{{ $t('assets.bridge') }}</span>
          <q-tooltip>
            <span class="text--tooltip">{{ $t('assets.bridge') }}</span>
          </q-tooltip>
        </custom-router-link>

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

        <a v-if="isZkyoto" :href="faucetSethLink" target="_blank" rel="noopener noreferrer">
          <button class="btn btn--icon">
            <astar-icon-faucet />
          </button>
          <span class="text--mobile-menu">{{ $t('assets.faucet') }}</span>
          <q-tooltip>
            <span class="text--tooltip">{{ $t('assets.faucet') }}</span>
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
import { useAccount, useBreakpoints, useFaucet, useNetworkInfo } from 'src/hooks';
import { faucetSethLink } from 'src/links';
import { getTokenImage } from 'src/modules/token';
import {
  buildEthereumBridgePageLink,
  buildTransferPageLink,
  buildLzBridgePageLink,
  buildCcipBridgePageLink,
} from 'src/router/routes';
import { useStore } from 'src/store';
import { computed, defineComponent, ref, watch, watchEffect } from 'vue';
import { nativeBridgeEnabled, layerZeroBridgeEnabled, ccipMinatoBridgeEnabled } from 'src/features';
import CustomRouterLink from '../common/CustomRouterLink.vue';
import Balloon from 'src/components/common/Balloon.vue';

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

    const isCcipBalloon = ref<boolean>(false);
    const isBalloonClosing = ref<boolean>(false);

    const { currentNetworkName, nativeTokenSymbol, isZkEvm, isZkyoto, isAstar, isShibuyaEvm } =
      useNetworkInfo();

    const closeCcipBalloon = () => {
      isCcipBalloon.value = false;
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
        isZkEvm: isZkEvm.value,
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

    // Memo: display the balloon animation
    watch(
      [isShibuyaEvm],
      async () => {
        if (isShibuyaEvm.value) {
          await wait(1000);
          isCcipBalloon.value = true;
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
      isZkEvm,
      isZkyoto,
      faucetSethLink,
      width,
      screenSize,
      isTruncate,
      isAstar,
      nativeBridgeEnabled,
      layerZeroBridgeEnabled,
      isShibuyaEvm,
      ccipMinatoBridgeEnabled,
      isCcipBalloon,
      isBalloonClosing,
      closeCcipBalloon,
      buildCcipBridgePageLink,
      truncate,
      handleModalFaucet,
      buildTransferPageLink,
      buildEthereumBridgePageLink,
      buildLzBridgePageLink,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list.scss';
</style>
