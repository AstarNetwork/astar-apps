<template>
  <div data-testid="evm-native-token">
    <!-- Total balance -->
    <div class="row--header">
      <div class="row__left">
        <div v-if="nativeTokenSymbol">
          <img width="32" :src="nativeTokenImg" :alt="nativeTokenSymbol" />
          <span>{{ nativeTokenSymbol }}</span>
        </div>
        <div v-else>
          <q-skeleton animation="fade" class="skeleton--md" />
        </div>
      </div>
      <div class="row__right">
        <div v-if="nativeTokenSymbol && currentNetworkName" class="total-balance">
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
    <div class="gradient-divider" />

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
        <div class="tw-font-semibold">Transferable</div>
        <div>
          <div v-if="nativeTokenSymbol && currentNetworkName" class="column--amount">
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

      <div class="row__action">
        <button v-if="isFaucet" class="btn btn--sm" @click="handleModalFaucet({ isOpen: true })">
          {{ $t('assets.faucet') }}
        </button>
        <router-link v-else :to="buildTransferPageLink(nativeTokenSymbol)">
          <button class="btn btn--sm">
            {{ $t('assets.transfer') }}
          </button>
        </router-link>
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
import TokenBalance from 'src/components/common/TokenBalance.vue';
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
    // TokenBalance
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
      handleModalFaucet,
      buildTransferPageLink,
      truncate,
      isTruncate,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list.scss';
</style>
