<template>
  <div data-testid="evm-native-token">
    <!-- Total balance -->
    <div class="row--header">
      <div class="row--header__left">
        <div v-if="nativeTokenSymbol" class="column--token-name">
          <img width="32" :src="nativeTokenImg" :alt="nativeTokenSymbol" />
          <span class="text--title">{{ nativeTokenSymbol }}</span>
        </div>
        <div v-else>
          <q-skeleton animation="fade" class="skeleton--md" />
        </div>
      </div>
      <div class="row--header__right">
        <div v-if="nativeTokenSymbol && currentNetworkName" class="column--balance">
          <span class="column--amount text--amount">
            {{ isTruncate ? $n(truncate(bal, 3)) : Number(bal) }}
          </span>
          <span class="column--symbol text--symbol">{{ nativeTokenSymbol }}</span>
        </div>
        <div v-else>
          <q-skeleton animation="fade" class="skeleton--md" />
        </div>
      </div>
    </div>

    <div class="separator" />

    <!-- Transferable -->
    <div class="row row--transferable">
      <div
        class="row__info"
        @click="
          () =>
            width <= screenSize.sm &&
            (isFaucet
              ? handleModalFaucet({ isOpen: true })
              : $router.push(buildTransferPageLink(nativeTokenSymbol)))
        "
      >
        <div class="column--label text--label">{{ $t('assets.transferable') }}</div>
        <div v-if="nativeTokenSymbol && currentNetworkName" class="column--balance">
          <span class="column--amount text--amount">
            {{ isTruncate ? $n(truncate(bal, 3)) : Number(bal) }}
          </span>
          <span class="column--symbol text--symbol">{{ nativeTokenSymbol }}</span>
        </div>
        <div v-else>
          <q-skeleton animation="fade" class="skeleton--md" />
        </div>
      </div>

      <div class="row__actions">
        <div v-if="isFaucet">
          <button class="btn btn--icon" @click="handleModalFaucet({ isOpen: true })">
            <!-- TODO: will move icon to AstarUI -->
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.9 17.61C11.18 17.66 10.36 17.44 9.47999 16.95C8.62999 16.47 8.07999 15.61 7.86999 14.4C7.81999 14.16 7.71999 13.97 7.55999 13.83C7.19999 13.51 6.63999 13.54 6.31999 13.91C6.13999 14.12 6.07999 14.37 6.13999 14.68C6.45999 16.39 7.23999 17.63 8.45999 18.37C9.55999 19.04 10.64 19.37 11.69 19.37C11.79 19.37 11.89 19.37 11.99 19.37C12.24 19.35 12.44 19.25 12.6 19.09C12.77 18.92 12.85 18.72 12.85 18.48C12.85 18.21 12.76 17.99 12.57 17.82C12.39 17.66 12.16 17.59 11.89 17.61H11.9Z"
                fill="currentColor"
              />
              <path
                d="M19.63 9.99006C19.13 8.87006 18.49 7.77006 17.74 6.74006C16.99 5.71006 16.17 4.73006 15.3 3.82006C14.43 2.92006 13.61 2.12006 12.87 1.46006C12.71 1.30006 12.52 1.19006 12.32 1.11006C11.92 0.960059 11.48 0.960059 11.08 1.11006C10.88 1.19006 10.69 1.30006 10.53 1.45006C9.79 2.12006 8.97 2.91006 8.1 3.82006C7.23 4.73006 6.41 5.71006 5.66 6.74006C4.91 7.77006 4.27 8.86006 3.77 9.99006C3.26 11.1301 3 12.2801 3 13.4101C3 15.9501 3.84 18.1101 5.49 19.8201C7.14 21.5301 9.23 22.4001 11.7 22.4001C14.17 22.4001 16.26 21.5301 17.91 19.8201C19.56 18.1101 20.4 15.9501 20.4 13.4101C20.4 12.2801 20.14 11.1301 19.63 9.99006ZM11.7 20.2901C9.8 20.2901 8.21 19.6301 6.97 18.3401C5.73 17.0401 5.1 15.3801 5.1 13.4101C5.1 12.0701 5.67 10.5201 6.78 8.81006C7.89 7.12006 9.54 5.24006 11.7 3.23006C13.86 5.24006 15.51 7.11006 16.62 8.81006C17.74 10.5201 18.3 12.0701 18.3 13.4101C18.3 15.3801 17.67 17.0401 16.43 18.3401C15.19 19.6401 13.6 20.2901 11.7 20.2901Z"
                fill="currentColor"
              />
            </svg>
          </button>
          <q-tooltip>
            <span class="text--tooltip">{{ $t('assets.faucet') }}</span>
          </q-tooltip>
        </div>

        <div v-else>
          <router-link :to="buildTransferPageLink(nativeTokenSymbol)">
            <button class="btn btn--icon">
              <astar-icon-transfer />
            </button>
          </router-link>
          <q-tooltip>
            <span class="text--tooltip">{{ $t('assets.send') }}</span>
          </q-tooltip>
        </div>
        <!-- Only SDN is able to bridge via cBridge at this moment -->
        <a
          v-if="nativeTokenSymbol === 'SDN'"
          :href="cbridgeAppLink"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button class="btn btn--sm">
            {{ $t('assets.bridge') }}
          </button>
        </a>
      </div>
    </div>

    <modal-faucet :is-modal-faucet="isModalFaucet" :handle-modal-faucet="handleModalFaucet" />
  </div>
</template>
<script lang="ts">
import { ethers } from 'ethers';
import { $web3 } from 'src/boot/api';
import { cbridgeAppLink } from 'src/c-bridge';
import ModalFaucet from 'src/components/assets/modals/ModalFaucet.vue';
import { faucetBalRequirement } from 'src/config/wallets';
import { useAccount, useNetworkInfo, usePrice, useBreakpoints } from 'src/hooks';
import { getTokenImage } from 'src/modules/token';
import { buildTransferPageLink } from 'src/router/routes';
import { useStore } from 'src/store';
import { computed, defineComponent, ref, watchEffect } from 'vue';
import { truncate } from '@astar-network/astar-sdk-core';

export default defineComponent({
  components: {
    ModalFaucet,
  },
  setup() {
    const bal = ref<number>(0);
    const balUsd = ref<number>(0);
    const isShibuya = ref<boolean>(false);
    const isRocstar = ref<boolean>(false);
    const isFaucet = ref<boolean>(false);
    const isModalFaucet = ref<boolean>(false);

    const { currentNetworkName, nativeTokenSymbol } = useNetworkInfo();
    const { currentAccount } = useAccount();
    const { nativeTokenUsd } = usePrice();
    const store = useStore();
    const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
    const isLoading = computed<boolean>(() => store.getters['general/isLoading']);

    const nativeTokenImg = computed<string>(() =>
      getTokenImage({ isNativeToken: true, symbol: nativeTokenSymbol.value })
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
          : isShibuya.value || faucetBalRequirement > bal.value;
        if (nativeTokenUsd) {
          balUsd.value = nativeTokenUsd * bal.value;
        }
      } catch (error: any) {
        console.error(error.message);
      }
    };

    watchEffect(async () => {
      await updateStates(nativeTokenUsd.value);
    });

    const handleModalFaucet = ({ isOpen }: { isOpen: boolean }): void => {
      isModalFaucet.value = isOpen;
    };

    const isTruncate = !nativeTokenSymbol.value.toUpperCase().includes('BTC');

    const { width, screenSize } = useBreakpoints();

    return {
      nativeTokenImg,
      nativeTokenSymbol,
      currentNetworkName,
      bal,
      balUsd,
      cbridgeAppLink,
      isFaucet,
      isModalFaucet,
      isTruncate,
      width,
      screenSize,
      truncate,
      handleModalFaucet,
      buildTransferPageLink,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list.scss';
</style>
