<template>
  <div>
    <!-- Total balance -->
    <div class="tw-px-4 tw-py-3 sm:tw-flex sm:tw-items-center">
      <div v-if="nativeTokenSymbol" class="tw-flex tw-items-center tw-space-x-1">
        <img width="32" :src="nativeTokenImg" :alt="nativeTokenSymbol" class="tw-shrink-0" />
        <span class="tw-font-extrabold tw-text-2xl">{{ nativeTokenSymbol }}</span>
      </div>
      <div v-else>
        <q-skeleton animation="fade" class="skeleton--md" />
      </div>
      <div class="sm:tw-flex-1">
        <div v-if="!isSkeleton" class="tw-flex tw-justify-end tw-items-end tw-space-x-2">
          <span class="tw-font-extrabold tw-text-2xl">
            {{ isTruncate ? $n(truncate(bal, 3)) : Number(bal) }}
          </span>
          <span class="tw-font-semibold tw-text-xl">{{ nativeTokenSymbol }}</span>
        </div>
        <div v-else class="skeleton--right">
          <q-skeleton animation="fade" class="skeleton--md" />
        </div>
      </div>
    </div>
    <div class="gradient-divider" />

    <div v-if="nativeTokenSymbol">
      <!-- Transferable -->
      <div class="tw-px-4 tw-py-3 sm:tw-flex sm:tw-items-center">
        <div
          class="sm:tw-flex sm:tw-items-center sm:tw-w-2/3 sm:tw-pointer-events-none"
          @click="
            () =>
              isFaucet
                ? handleModalFaucet({ isOpen: true })
                : $router.push(buildTransferPageLink(nativeTokenSymbol))
          "
        >
          <div class="tw-font-semibold sm:tw-w-1/2">Transferable</div>
          <div class="sm:tw-w-1/2">
            <div v-if="!isSkeleton" class="tw-flex tw-justify-end tw-items-end tw-space-x-2">
              <span class="tw-font-extrabold tw-text-2xl">
                {{
                  isTruncate ? $n(truncate(transferableBalance, 3)) : Number(transferableBalance)
                }}
              </span>
              <span class="tw-font-semibold tw-text-xl">{{ nativeTokenSymbol }}</span>
            </div>
            <div v-else>
              <div class="skeleton--right">
                <q-skeleton animation="fade" class="skeleton--md" />
              </div>
            </div>
          </div>
        </div>
        <div class="tw-hidden sm:tw-flex sm:tw-justify-end sm:tw-w-1/3">
          <button
            v-if="isFaucet"
            class="btn btn--sm column---title-button"
            @click="handleModalFaucet({ isOpen: true })"
          >
            {{ $t('assets.faucet') }}
          </button>
          <router-link v-else :to="buildTransferPageLink(nativeTokenSymbol)">
            <button class="btn btn--sm">
              {{ $t('assets.transfer') }}
            </button>
          </router-link>
        </div>
      </div>

      <!-- Locked tokens -->
      <div
        class="
          tw-bg-gray-50 tw-px-4 tw-py-3
          sm:tw-rounded-2xl sm:tw-flex sm:tw-flex-wrap sm:tw-items-center
        "
      >
        <div
          class="sm:tw-flex sm:tw-items-center sm:tw-w-2/3 sm:tw-pointer-events-none"
          @click="isExpand = !isExpand"
        >
          <div class="tw-font-semibold sm:tw-w-1/2">Locked tokens</div>
          <div class="sm:tw-w-1/2">
            <div v-if="!isSkeleton" class="tw-flex tw-justify-end tw-items-end tw-space-x-2">
              <span class="tw-font-extrabold tw-text-2xl">
                {{ isTruncate ? $n(truncate(vestingTtl, 3)) : Number(vestingTtl) }}
              </span>
              <span class="tw-font-semibold tw-text-xl">{{ nativeTokenSymbol }}</span>
            </div>
            <div v-else>
              <div class="skeleton--right">
                <q-skeleton animation="fade" class="skeleton--md" />
              </div>
            </div>
          </div>
        </div>

        <div class="tw-hidden sm:tw-flex sm:tw-justify-end sm:tw-w-1/3">
          <button
            class="icon--expand"
            :class="isExpand && 'icon--collapse'"
            @click="isExpand = !isExpand"
          >
            <astar-icon-expand size="32" />
          </button>
        </div>

        <q-slide-transition>
          <div v-show="isExpand" class="tw-w-full tw-py-4 tw-space-y-2">
            <!-- Vesting -->
            <div class="tw-flex tw-bg-white tw-rounded-xl tw-p-4">
              <div
                class="sm:tw-pointer-events-none sm:tw-w-2/3 tw-flex tw-w-full"
                @click="handleModalVesting({ isOpen: true })"
              >
                <div class="tw-font-semibold tw-w-1/2">Vesting</div>
                <div class="tw-flex-1 tw-w-1/2">
                  <div v-if="!isSkeleton" class="column__box-native">
                    <span class="tw-font-semibold">
                      <token-balance :balance="String(vestingTtl)" :symbol="nativeTokenSymbol" />
                    </span>
                  </div>
                  <div v-else class="column__box-native">
                    <div class="skeleton--right">
                      <q-skeleton animation="fade" class="skeleton--md" />
                    </div>
                  </div>
                </div>
              </div>
              <div class="tw-w-1/3 tw-hidden sm:tw-flex tw-justify-end">
                <button class="btn btn--sm" @click="handleModalVesting({ isOpen: true })">
                  {{ $t('assets.view') }}
                </button>
              </div>
            </div>

            <!-- Staking -->
            <div class="tw-flex tw-bg-white tw-rounded-xl tw-p-4">
              <div
                class="sm:tw-pointer-events-none sm:tw-w-2/3 tw-flex tw-w-full"
                @click="() => $router.push(Path.DappStaking)"
              >
                <div class="tw-font-semibold tw-w-1/2">Staking</div>
                <div class="tw-flex-1 tw-w-1/2">
                  <div v-if="!isSkeleton" class="column__box-native">
                    <span class="tw-font-semibold">
                      <token-balance
                        :balance="String(lockInDappStaking)"
                        :symbol="nativeTokenSymbol"
                      />
                    </span>
                  </div>
                  <div v-else class="column__box-native">
                    <div class="skeleton--right">
                      <q-skeleton animation="fade" class="skeleton--md" />
                    </div>
                  </div>
                </div>
              </div>
              <div class="tw-w-1/3 tw-hidden sm:tw-flex tw-justify-end">
                <router-link :to="Path.DappStaking">
                  <button class="btn btn--sm">{{ $t('manage') }}</button>
                </router-link>
              </div>
            </div>
          </div>
        </q-slide-transition>
      </div>
    </div>

    <modal-faucet :is-modal-faucet="isModalFaucet" :handle-modal-faucet="handleModalFaucet" />
    <modal-evm-withdraw
      :is-modal-evm-withdraw="isModalEvmWithdraw"
      :handle-modal-evm-withdraw="handleModalEvmWithdraw"
      :native-token-symbol="nativeTokenSymbol"
    />
    <modal-vesting
      :is-modal-vesting="isModalVesting"
      :handle-modal-vesting="handleModalVesting"
      :native-token-symbol="nativeTokenSymbol"
      :account-data="accountData"
    />
  </div>
</template>
<script lang="ts">
import { u8aToString } from '@polkadot/util';
import { ethers } from 'ethers';
import { useBalance, useBalloons, useEvmDeposit, useNetworkInfo, usePrice } from 'src/hooks';
import { checkIsNullOrUndefined } from '@astar-network/astar-sdk-core';
import { getTokenImage } from 'src/modules/token';
import { generateAstarNativeTokenObject } from 'src/modules/xcm/tokens';
import { useStore } from 'src/store';
import { computed, defineComponent, ref, watchEffect, watch } from 'vue';
import { buildTransferPageLink } from 'src/router/routes';
import ModalEvmWithdraw from 'src/components/assets/modals/ModalEvmWithdraw.vue';
import ModalFaucet from 'src/components/assets/modals/ModalFaucet.vue';
import ModalVesting from 'src/components/assets/modals/ModalVesting.vue';
import { Path } from 'src/router';
import TokenBalance from 'src/components/common/TokenBalance.vue';
import { faucetBalRequirement } from 'src/config/wallets';
import Balloon from 'src/components/common/Balloon.vue';
import { truncate } from '@astar-network/astar-sdk-core';
import { $api } from 'src/boot/api';
import { is } from 'quasar';

export default defineComponent({
  components: {
    ModalFaucet,
    ModalEvmWithdraw,
    ModalVesting,
    TokenBalance,
    // Balloon,
  },
  setup() {
    const isModalTransfer = ref<boolean>(false);
    const isModalFaucet = ref<boolean>(false);
    const isModalEvmWithdraw = ref<boolean>(false);
    const isModalVesting = ref<boolean>(false);
    const bal = ref<number>(0);
    const balUsd = ref<number | null>(null);
    const vestingTtl = ref<number>(0);
    const lockInDappStaking = ref<number>(0);
    const isRocstar = ref<boolean>(false);
    const isShibuya = ref<boolean>(false);
    const isFaucet = ref<boolean>(false);
    const isExpand = ref<boolean>(false);
    const { isBalloonNativeToken, isBalloonNativeTokenClosing, handleCloseNativeTokenBalloon } =
      useBalloons();

    const store = useStore();
    const isLoading = computed<boolean>(() => store.getters['general/isLoading']);
    const selectedAddress = computed(() => store.getters['general/selectedAddress']);
    const { balance, accountData, isLoadingBalance } = useBalance(selectedAddress);
    const { numEvmDeposit } = useEvmDeposit();
    const { nativeTokenUsd } = usePrice();
    const { currentNetworkName, nativeTokenSymbol, isSupportXvmTransfer } = useNetworkInfo();

    const xcmNativeToken = computed(() => generateAstarNativeTokenObject(nativeTokenSymbol.value));

    const nativeTokenImg = computed(() =>
      getTokenImage({ isNativeToken: true, symbol: nativeTokenSymbol.value })
    );

    const transferableBalance = computed<string>(() => {
      return accountData.value
        ? ethers.utils.formatEther(accountData.value.getUsableTransactionBalance().toString())
        : '0';
    });

    const isSkeleton = computed<boolean>(() => {
      return checkIsNullOrUndefined(nativeTokenSymbol.value) || isLoadingBalance.value;
    });

    const handleModalFaucet = ({ isOpen }: { isOpen: boolean }) => {
      isModalFaucet.value = isOpen;
    };
    const handleModalEvmWithdraw = ({ isOpen }: { isOpen: boolean }) => {
      isModalEvmWithdraw.value = isOpen;
    };
    const handleModalVesting = ({ isOpen }: { isOpen: boolean }) => {
      isModalVesting.value = isOpen;
    };

    const setBalanceData = (): void => {
      const tokenSymbolRef = nativeTokenSymbol.value;
      if (!balance.value || !tokenSymbolRef) return;
      try {
        bal.value = Number(ethers.utils.formatEther(balance.value.toString()));
        isShibuya.value = tokenSymbolRef === 'SBY';
        isRocstar.value = tokenSymbolRef === 'RSTR';
        isFaucet.value = isRocstar.value
          ? false
          : isShibuya.value || faucetBalRequirement > bal.value;
        if (nativeTokenUsd.value) {
          balUsd.value = nativeTokenUsd.value * bal.value;
        } else {
          balUsd.value = 0;
        }
      } catch (error: any) {
        console.error(error.message);
      }
    };

    watch([nativeTokenSymbol, balance], setBalanceData, { immediate: false });

    watchEffect(() => {
      const accountDataRef = accountData.value;
      if (!accountDataRef) return;
      // Memo: `vesting ` -> there has been inputted 1 space here
      const vesting = accountDataRef.locks.find((it) => u8aToString(it.id) === 'vesting ');
      const dappStake = accountDataRef.locks.find((it) => u8aToString(it.id) === 'dapstake');

      if (vesting) {
        const amount = String(vesting.amount);
        vestingTtl.value = Number(ethers.utils.formatEther(amount));
      }
      if (dappStake) {
        const amount = String(dappStake.amount);
        lockInDappStaking.value = Number(ethers.utils.formatEther(amount));
      }
    });

    // Ref: https://stackoverflow.com/questions/48143381/css-expand-contract-animation-to-show-hide-content
    // const expandAsset = async (isOpen: boolean): Promise<void> => {
    //   if (isBalloonNativeToken.value) {
    //     await handleCloseNativeTokenBalloon();
    //   }
    //   isExpand.value = !isOpen;
    //   const el = document.getElementById(isOpen ? 'asset-expand' : 'asset-expand-close');
    //   el && el.classList.toggle('asset-expanded');
    //   el && el.classList.toggle('asset-collapsed');
    // };

    const isTruncate = !nativeTokenSymbol.value.toUpperCase().includes('BTC');

    return {
      bal,
      nativeTokenSymbol,
      balUsd,
      currentNetworkName,
      numEvmDeposit,
      isShibuya,
      vestingTtl,
      lockInDappStaking,
      isFaucet,
      transferableBalance,
      isModalTransfer,
      accountData,
      nativeTokenImg,
      isModalFaucet,
      isModalEvmWithdraw,
      isModalVesting,
      xcmNativeToken,
      isLoading,
      Path,
      isSkeleton,
      isSupportXvmTransfer,
      isExpand,
      isBalloonNativeToken,
      isBalloonNativeTokenClosing,
      buildTransferPageLink,
      handleModalVesting,
      handleModalFaucet,
      handleModalEvmWithdraw,
      // expandAsset,
      handleCloseNativeTokenBalloon,
      truncate,
      isTruncate,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list.scss';
</style>
