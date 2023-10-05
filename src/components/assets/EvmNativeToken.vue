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
          <span class="text--amount">
            {{ isTruncate ? $n(truncate(bal, 3)) : Number(bal) }}
          </span>
          <span class="text--symbol">{{ nativeTokenSymbol }}</span>
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
            isFaucet
              ? handleModalFaucet({ isOpen: true })
              : $router.push(buildTransferPageLink(nativeTokenSymbol))
        "
      >
        <div class="text--label">{{ $t('assets.transferable') }}</div>
        <div>
          <div v-if="nativeTokenSymbol && currentNetworkName" class="column--balance">
            <span class="text--amount">
              {{ isTruncate ? $n(truncate(bal, 3)) : Number(bal) }}
            </span>
            <span class="text--symbol">{{ nativeTokenSymbol }}</span>
          </div>
          <div v-else>
            <q-skeleton animation="fade" class="skeleton--md" />
          </div>
        </div>
      </div>

      <div class="row__actions">
        <div v-if="isFaucet">
          <button class="btn btn--icon" @click="handleModalFaucet({ isOpen: true })">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="icon--faucet"
            >
              <path
                d="M14.7779 23.1919C14.4179 23.1919 14.0879 23.0119 13.8879 22.7019L9.06792 15.1219L1.48792 10.3019C1.14792 10.0819 0.957917 9.6919 1.00792 9.2919C1.05792 8.8919 1.33792 8.55191 1.71792 8.42191L20.8079 2.0519C21.1879 1.9319 21.5979 2.0219 21.8779 2.3019C22.1579 2.5819 22.2579 3.0019 22.1279 3.3719L15.7679 22.4619C15.6379 22.8419 15.2979 23.1219 14.8979 23.1719C14.8579 23.1719 14.8079 23.1719 14.7679 23.1719L14.7779 23.1919ZM11.1679 14.5119L14.4779 19.7219L19.4779 4.7119L4.46792 9.71191L9.67792 13.0219L14.7379 7.96191C15.1479 7.55191 15.8079 7.55191 16.2179 7.96191C16.6279 8.3719 16.6279 9.04191 16.2179 9.44191L11.1579 14.5019L11.1679 14.5119Z"
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
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="icon--transfer"
              >
                <path
                  d="M14.7779 23.1919C14.4179 23.1919 14.0879 23.0119 13.8879 22.7019L9.06792 15.1219L1.48792 10.3019C1.14792 10.0819 0.957917 9.6919 1.00792 9.2919C1.05792 8.8919 1.33792 8.55191 1.71792 8.42191L20.8079 2.0519C21.1879 1.9319 21.5979 2.0219 21.8779 2.3019C22.1579 2.5819 22.2579 3.0019 22.1279 3.3719L15.7679 22.4619C15.6379 22.8419 15.2979 23.1219 14.8979 23.1719C14.8579 23.1719 14.8079 23.1719 14.7679 23.1719L14.7779 23.1919ZM11.1679 14.5119L14.4779 19.7219L19.4779 4.7119L4.46792 9.71191L9.67792 13.0219L14.7379 7.96191C15.1479 7.55191 15.8079 7.55191 16.2179 7.96191C16.6279 8.3719 16.6279 9.04191 16.2179 9.44191L11.1579 14.5019L11.1679 14.5119Z"
                  fill="currentColor"
                />
              </svg>
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
import { useAccount, useNetworkInfo, usePrice } from 'src/hooks';
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
