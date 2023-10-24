<template>
  <div>
    <div>
      <div v-if="nativeTokenSymbol">
        <!-- Total balance -->
        <div class="row--header">
          <div class="row--header__left">
            <div v-if="nativeTokenSymbol && currentNetworkName" class="column--token-name">
              <img width="24" :src="nativeTokenImg" :alt="nativeTokenSymbol" />
              <span class="text--title">{{ nativeTokenSymbol }}</span>
            </div>
            <div v-else>
              <q-skeleton animation="fade" class="skeleton--md" />
            </div>
          </div>
          <div class="row--header__right">
            <div v-if="!isSkeleton" class="column--balance">
              <div class="column--amount text--amount">
                {{ isTruncate ? $n(truncate(bal, 3)) : Number(bal) }}
              </div>
              <div class="column--symbol text--symbol">{{ nativeTokenSymbol }}</div>
            </div>
            <div v-else class="skeleton--right">
              <q-skeleton animation="fade" class="skeleton--md" />
            </div>

            <!-- <div v-if="isFaucet">
              <button class="btn btn--icon" @click="handleModalFaucet({ isOpen: true })">
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
            </div> -->

            <!-- <div v-else>
              <router-link :to="buildTransferPageLink(nativeTokenSymbol)">
                <button class="btn btn--icon">
                  <astar-icon-transfer />
                </button>
                <q-tooltip>
                  <span class="text--tooltip">{{ $t('assets.send') }}</span>
                </q-tooltip>
              </router-link>
            </div> -->
          </div>
        </div>

        <div class="separator" />

        <!-- Transferable -->
        <div class="row row--transferable">
          <div class="row__info">
            <div class="column--label text--label">
              {{ $t('assets.transferable') }}
            </div>
            <div v-if="!isSkeleton" class="column--balance">
              <span class="column--amount text--amount">
                {{
                  isTruncate ? $n(truncate(transferableBalance, 3)) : Number(transferableBalance)
                }}
              </span>
              <span class="column--symbol text--symbol">{{ nativeTokenSymbol }}</span>
            </div>
            <div v-else>
              <div class="skeleton--right">
                <q-skeleton animation="fade" class="skeleton--md" />
              </div>
            </div>
          </div>

          <div class="row__actions">
            <router-link :to="buildTransferPageLink(nativeTokenSymbol)">
              <button class="btn btn--icon">
                <astar-icon-transfer />
              </button>
              <q-tooltip>
                <span class="text--tooltip">{{ $t('assets.send') }}</span>
              </q-tooltip>
            </router-link>
          </div>
        </div>

        <!-- Evm Deposit -->
        <div v-if="numEvmDeposit" class="row row--transferable">
          <div class="row__info">
            <div class="column--label text--label">
              {{ $t('assets.yourEvmDeposit') }}
            </div>
            <div v-if="!isSkeleton" class="column--balance">
              <span class="column--amount text--amount">
                {{ isTruncate ? $n(truncate(numEvmDeposit, 3)) : Number(numEvmDeposit) }}
              </span>
              <span class="column--symbol text--symbol">{{ nativeTokenSymbol }}</span>
            </div>
            <div v-else>
              <div class="skeleton--right">
                <q-skeleton animation="fade" class="skeleton--md" />
              </div>
            </div>
          </div>
          <div class="row__actions">
            <button class="btn btn--sm" @click="handleModalEvmWithdraw({ isOpen: true })">
              {{ $t('assets.withdraw') }}
            </button>
          </div>
        </div>

        <!-- Locked tokens -->
        <div class="row row--locked-tokens">
          <div class="row__info">
            <div class="column--label text--label">
              {{ $t('assets.lockedTokens') }}
            </div>
            <div v-if="!isSkeleton" class="column--balance">
              <div class="column--amount text--amount">
                {{ isTruncate ? $n(truncate(lockInDappStaking, 3)) : Number(lockInDappStaking) }}
              </div>
              <div class="column--symbol text--symbol">
                {{ nativeTokenSymbol }}
              </div>
            </div>
            <div v-else>
              <div class="skeleton--right">
                <q-skeleton animation="fade" class="skeleton--md" />
              </div>
            </div>
          </div>

          <div class="row__actions">
            <button
              class="icon--expand"
              :class="isExpand && 'icon--collapse'"
              @click="expandAsset(isExpand)"
            >
              <astar-icon-expand size="32" />
              <q-tooltip>
                <span class="text--tooltip">
                  {{ $t(isExpand ? 'assets.collapse' : 'assets.expand') }}
                </span>
              </q-tooltip>
            </button>
          </div>
        </div>

        <div class="expand-container">
          <div :id="isExpand ? 'asset-expand' : 'asset-expand-close'">
            <div class="row--bg--extend row--details-native bg--accent">
              <div class="row__left">
                <span class="text--md">{{ $t('assets.transferable') }}</span>
              </div>
              <div class="row__right row__right-collapse">
                <div class="column--balance">
                  <div v-if="!isSkeleton" class="column__box-native">
                    <span class="text--value">
                      <token-balance :balance="transferableBalance" :symbol="nativeTokenSymbol" />
                    </span>
                  </div>
                  <div v-else class="column__box-native">
                    <div class="skeleton--right">
                      <q-skeleton animation="fade" class="skeleton--md" />
                    </div>
                  </div>
                </div>
                <div class="column--buttons">
                  <router-link :to="buildTransferPageLink(nativeTokenSymbol)">
                    <button class="btn btn--sm">
                      {{ $t('assets.transfer') }}
                    </button>
                  </router-link>
                </div>
              </div>
            </div>
            <div class="row--bg--extend row--details-native bg--accent">
              <div class="row__left">
                <span class="text--md">{{ $t('assets.vesting') }}</span>
              </div>
              <div class="row__right row__right-collapse">
                <div class="column--balance">
                  <div v-if="!isSkeleton" class="column__box-native">
                    <span class="text--value">
                      <token-balance :balance="String(vestingTtl)" :symbol="nativeTokenSymbol" />
                    </span>
                  </div>
                  <div v-else class="column__box-native">
                    <div class="skeleton--right">
                      <q-skeleton animation="fade" class="skeleton--md" />
                    </div>
                  </div>
                </div>
                <div class="column--buttons">
                  <button class="btn btn--sm" @click="handleModalVesting({ isOpen: true })">
                    {{ $t('assets.view') }}
                  </button>
                </div>
              </div>
            </div>

            <div class="row--bg--extend row--details-native bg--accent">
              <div class="row__left">
                <span class="text--md">{{ $t('common.staking') }}</span>
              </div>
              <div class="row__right row__right-collapse">
                <div class="column--balance">
                  <div v-if="!isSkeleton" class="column__box-native">
                    <span class="text--value">
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
                <div class="column--buttons">
                  <router-link :to="Path.DappStaking">
                    <button class="btn btn--sm">{{ $t('manage') }}</button>
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
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
import {
  useBalance,
  useBalloons,
  useEvmDeposit,
  useNetworkInfo,
  usePrice,
  useBreakpoints,
} from 'src/hooks';
import { checkIsNullOrUndefined, truncate } from '@astar-network/astar-sdk-core';
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

export default defineComponent({
  components: {
    ModalFaucet,
    ModalEvmWithdraw,
    ModalVesting,
    TokenBalance,
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
    const expandAsset = async (isOpen: boolean): Promise<void> => {
      if (isBalloonNativeToken.value) {
        await handleCloseNativeTokenBalloon();
      }
      isExpand.value = !isOpen;
      const el = document.getElementById(isOpen ? 'asset-expand' : 'asset-expand-close');
      el && el.classList.toggle('asset-expanded');
      el && el.classList.toggle('asset-collapsed');
    };

    const { width, screenSize } = useBreakpoints();

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

      width,
      screenSize,
      isTruncate,
      truncate,
      buildTransferPageLink,
      handleModalVesting,
      handleModalFaucet,
      handleModalEvmWithdraw,
      expandAsset,
      handleCloseNativeTokenBalloon,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list.scss';
</style>
