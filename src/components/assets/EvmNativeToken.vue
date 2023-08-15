<template>
  <div>
    <div class="rows">
      <div class="row row--details">
        <div class="row__left">
          <div class="column--currency">
            <img class="token-logo" :src="nativeTokenImg" :alt="nativeTokenSymbol" />
            <div v-if="nativeTokenSymbol && currentNetworkName" class="column--ticker">
              <span class="text--title">{{ nativeTokenSymbol }}</span>
              <span class="text--label">{{ currentNetworkName }}</span>
            </div>
            <div v-else>
              <q-skeleton animation="fade" class="skeleton--md" />
            </div>
          </div>
        </div>
        <div class="row__right row__right--evm">
          <div class="column column--balance">
            <div class="column__box">
              <div class="text--accent">
                <token-balance :balance="String(bal)" :symbol="nativeTokenSymbol" />
              </div>
              <div class="text--label">
                <span>{{ $n(balUsd) }} {{ $t('usd') }}</span>
              </div>
            </div>
          </div>
          <div class="column--asset-buttons column--buttons--native-token">
            <router-link :to="buildTransferPageLink(nativeTokenSymbol)">
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

            <button
              v-if="isFaucet"
              class="btn btn--sm"
              @click="handleModalFaucet({ isOpen: true })"
            >
              {{ $t('assets.faucet') }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <modal-faucet :is-modal-faucet="isModalFaucet" :handle-modal-faucet="handleModalFaucet" />
  </div>
</template>
<script lang="ts">
import { ethers } from 'ethers';
import { $web3 } from 'src/boot/api';
import { cbridgeAppLink } from 'src/c-bridge';
import TokenBalance from 'src/components/common/TokenBalance.vue';
import { faucetBalRequirement } from 'src/config/wallets';
import { useAccount, useBalance, useBreakpoints, useNetworkInfo, usePrice } from 'src/hooks';
import { getTokenImage } from 'src/modules/token';
import { buildTransferPageLink } from 'src/router/routes';
import { useStore } from 'src/store';
import { computed, defineComponent, ref, watchEffect } from 'vue';
import ModalFaucet from 'src/components/assets/modals/ModalFaucet.vue';

export default defineComponent({
  components: { ModalFaucet },
  setup() {
    const { currentNetworkIdx, evmNetworkIdx } = useNetworkInfo();
    const bal = ref<number>(0);
    const balUsd = ref<number>(0);
    const isShibuya = ref<boolean>(false);
    const isRocstar = ref<boolean>(false);
    const isFaucet = ref<boolean>(false);
    const isSearch = ref<boolean>(false);
    const search = ref<string>('');
    const isModalFaucet = ref<boolean>(false);

    const { width, screenSize } = useBreakpoints();
    const { currentAccount } = useAccount();
    const { nativeTokenUsd } = usePrice();
    const { accountData } = useBalance(currentAccount);

    const store = useStore();
    const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
    const isLoading = computed<boolean>(() => store.getters['general/isLoading']);

    const { currentNetworkName, nativeTokenSymbol, isMainnet } = useNetworkInfo();

    const nativeTokenImg = computed<string>(() =>
      getTokenImage({ isNativeToken: true, symbol: nativeTokenSymbol.value })
    );
    // const isListReady = computed<boolean>(() => !!(!isMainnet.value || props.tokens.length > 0));

    const isDisplayNativeToken = computed<boolean>(() => {
      return (
        !search.value || nativeTokenSymbol.value.toLowerCase().includes(search.value.toLowerCase())
      );
    });
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

    return {
      isDisplayNativeToken,
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
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list.scss';
</style>
