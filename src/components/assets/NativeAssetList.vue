<template>
  <div>
    <div class="border--separator border--margin" />
    <div>
      <div v-if="nativeTokenSymbol" class="rows">
        <div class="row row--details-native">
          <div class="row__left--native">
            <div class="column--currency">
              <img width="24" :src="nativeTokenImg" :alt="nativeTokenSymbol" />
              <div v-if="nativeTokenSymbol && currentNetworkName" class="column--ticker--native">
                <span class="text--title">{{ nativeTokenSymbol }}</span>
                <span class="text--label">{{ currentNetworkName }}</span>
              </div>
              <div v-else>
                <q-skeleton animation="fade" class="skeleton--md" />
              </div>
            </div>
          </div>
          <div class="row__right">
            <div class="column--balance">
              <div class="column__box-native">
                <div v-if="!isSkeleton" class="text--accent">
                  <token-balance :balance="String(bal)" :symbol="nativeTokenSymbol" />
                </div>
                <div v-else class="skeleton--right">
                  <q-skeleton animation="fade" class="skeleton--md" />
                </div>
                <div v-if="!isSkeleton" class="text--label row--transferable">
                  <div class="screen--phone">
                    <span>{{ $t('assets.transferableBalance') }}</span>
                  </div>
                  <div class="column--transferable-bal">
                    <span class="screen--sm">{{ $t('assets.transferable') }}</span>
                    <span>
                      <token-balance :balance="transferableBalance" :symbol="nativeTokenSymbol" />
                    </span>
                  </div>
                </div>
                <div v-else class="skeleton--right">
                  <q-skeleton animation="fade" class="skeleton--md" />
                </div>
              </div>
            </div>

            <div v-if="isFaucet" class="column--buttons">
              <button
                class="btn btn--sm column---title-button"
                @click="handleModalFaucet({ isOpen: true })"
              >
                {{ $t('assets.faucet') }}
              </button>
            </div>
            <div v-else class="column--buttons">
              <router-link
                :to="buildTransferPageLink(nativeTokenSymbol)"
                class="column---title-button"
              >
                <button class="btn btn--sm">
                  {{ $t('assets.transfer') }}
                </button>
              </router-link>
            </div>
            <div class="row--icon--expand">
              <div class="column--expand">
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

                <balloon
                  class="balloon-native-token"
                  direction="right"
                  :is-balloon="isBalloonNativeToken"
                  :is-balloon-closing="isBalloonNativeTokenClosing"
                  :handle-close-balloon="handleCloseNativeTokenBalloon"
                  :title="$t('new')"
                  :text="$t('assets.assetsAreNowFolded', { token: nativeTokenSymbol })"
                />
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="numEvmDeposit"
          class="row--bg--extend-evm-withdraw row--details-native bg--accent"
        >
          <div class="row__left">
            <span class="text--md">{{ $t('assets.yourEvmDeposit') }}</span>
          </div>
          <div class="row__right row__right-collapse">
            <div class="column--balance">
              <div v-if="!isSkeleton" class="column__box-native">
                <span class="text--value">
                  <token-balance :balance="String(numEvmDeposit)" :symbol="nativeTokenSymbol" />
                </span>
              </div>
              <div v-else class="column__box-native">
                <div class="skeleton--right">
                  <q-skeleton animation="fade" class="skeleton--md" />
                </div>
              </div>
            </div>
            <div class="column--buttons">
              <button class="btn btn--sm" @click="handleModalEvmWithdraw({ isOpen: true })">
                {{ $t('assets.withdraw') }}
              </button>
            </div>
          </div>
        </div>

        <div class="expand-container">
          <div :id="isExpand ? 'asset-expand' : 'asset-expand-close'">
            <div class="row--bg--extend row--details-native bg--accent">
              <div class="row__left">
                <span class="text--md">{{ $t('assets.transferableBalance') }}</span>
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
                <span class="text--md">{{ $t('assets.yourVestingInfo') }}</span>
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
                <span class="text--md">{{ $t('assets.yourStaking') }}</span>
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
        <div class="row--icon--expand-phone">
          <button
            class="icon--expand"
            :class="isExpand && 'icon--collapse'"
            @click="expandAsset(isExpand)"
          >
            <astar-icon-expand size="32" />
          </button>
          <balloon
            direction="top"
            :is-balloon="isBalloonNativeToken"
            :is-balloon-closing="isBalloonNativeTokenClosing"
            :handle-close-balloon="handleCloseNativeTokenBalloon"
            :title="$t('new')"
            :text="$t('assets.assetsAreNowFolded', { token: nativeTokenSymbol })"
          />
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

export default defineComponent({
  components: {
    ModalFaucet,
    ModalEvmWithdraw,
    ModalVesting,
    TokenBalance,
    Balloon,
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
      expandAsset,
      handleCloseNativeTokenBalloon,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list.scss';
</style>
