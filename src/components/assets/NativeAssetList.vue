<template>
  <div>
    <div class="container">
      <div class="row">
        <span class="text--title">{{ $t('assets.assets') }}</span>
      </div>

      <div class="border--separator" />

      <div v-if="nativeTokenSymbol" class="rows">
        <div class="row row--details">
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
              <div class="column__box">
                <div v-if="bal !== null && nativeTokenSymbol" class="text--accent">
                  <span>{{ $n(truncate(bal)) }} {{ nativeTokenSymbol }}</span>
                </div>
                <div v-else class="skeleton--right">
                  <q-skeleton animation="fade" class="skeleton--md" />
                </div>
                <div v-if="balUsd !== null" class="text--label">
                  <span>{{ $n(balUsd) }} {{ $t('usd') }}</span>
                </div>
                <div v-else class="skeleton--right">
                  <q-skeleton animation="fade" class="skeleton--md" />
                </div>
              </div>
            </div>
            <div v-if="isFaucet" class="column--buttons">
              <button class="btn btn--sm" @click="handleModalFaucet({ isOpen: true })">
                {{ $t('assets.faucet') }}
              </button>
            </div>
          </div>
        </div>

        <div class="row--bg--extend row--details bg--accent">
          <div class="row__left">
            <span class="text--md">{{ $t('assets.transferableBalance') }}</span>
          </div>
          <div class="row__right">
            <div class="column--balance">
              <div v-if="!checkIsNullOrUndefined(nativeTokenSymbol)" class="column__box">
                <span class="text--value"
                  >{{ $n(truncate(transferableBalance)) }} {{ nativeTokenSymbol }}</span
                >
              </div>
              <div v-else class="column__box">
                <div class="skeleton--right">
                  <q-skeleton animation="fade" class="skeleton--md" />
                </div>
              </div>
            </div>
            <div class="column--buttons" :class="isDisplayXcmButton && 'column--two-buttons'">
              <button
                class="btn btn--sm"
                @click="handleModalTransfer({ isOpen: true, currency: nativeTokenSymbol })"
              >
                {{ $t('assets.transfer') }}
              </button>
              <button
                v-if="isDisplayXcmButton"
                class="btn btn--sm"
                @click="
                  handleModalXcmBridge({
                    isOpen: true,
                    currency: xcmNativeToken,
                  })
                "
              >
                {{ $t('assets.xcm') }}
              </button>
            </div>
          </div>
        </div>

        <div class="row--bg--extend row--details bg--accent">
          <div class="row__left">
            <span class="text--md">{{ $t('assets.yourEvmDeposit') }}</span>
          </div>
          <div class="row__right">
            <div class="column--balance">
              <div v-if="!checkIsNullOrUndefined(nativeTokenSymbol)" class="column__box">
                <span class="text--value"
                  >{{ $n(truncate(numEvmDeposit)) }} {{ nativeTokenSymbol }}</span
                >
              </div>
              <div v-else class="column__box">
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

        <div class="row--bg--extend row--details bg--accent">
          <div class="row__left">
            <span class="text--md">{{ $t('assets.yourVestingInfo') }}</span>
          </div>
          <div class="row__right">
            <div class="column--balance">
              <div v-if="!checkIsNullOrUndefined(nativeTokenSymbol)" class="column__box">
                <span class="text--value"
                  >{{ $n(truncate(vestingTtl)) }} {{ nativeTokenSymbol }}</span
                >
              </div>
              <div v-else class="column__box">
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

        <div class="row--bg--extend row--details bg--accent">
          <div class="row__left">
            <span class="text--md">{{ $t('assets.yourStaking') }}</span>
          </div>
          <div class="row__right">
            <div class="column--balance">
              <div v-if="!checkIsNullOrUndefined(nativeTokenSymbol)" class="column__box">
                <span class="text--value"
                  >{{ $n(truncate(lockInDappStaking)) }} {{ nativeTokenSymbol }}</span
                >
              </div>
              <div v-else class="column__box">
                <div class="skeleton--right">
                  <q-skeleton animation="fade" class="skeleton--md" />
                </div>
              </div>
            </div>
            <div class="column--buttons">
              <router-link to="/dapp-staking">
                <button class="btn btn--sm">{{ $t('manage') }}</button>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="#app--main">
      <ModalTransfer
        :is-modal-transfer="isModalTransfer"
        :handle-modal-transfer="handleModalTransfer"
        :symbol="nativeTokenSymbol"
        :account-data="accountData"
      />
      <ModalFaucet :is-modal-faucet="isModalFaucet" :handle-modal-faucet="handleModalFaucet" />
      <ModalEvmWithdraw
        :is-modal-evm-withdraw="isModalEvmWithdraw"
        :handle-modal-evm-withdraw="handleModalEvmWithdraw"
        :native-token-symbol="nativeTokenSymbol"
      />
      <ModalVesting
        :is-modal-vesting="isModalVesting"
        :handle-modal-vesting="handleModalVesting"
        :native-token-symbol="nativeTokenSymbol"
        :account-data="accountData"
      />
    </Teleport>
  </div>
</template>
<script lang="ts">
import { u8aToString } from '@polkadot/util';
import { ethers } from 'ethers';
import { useBalance, useEvmDeposit, usePrice } from 'src/hooks';
import { checkIsNullOrUndefined, truncate } from 'src/hooks/helper/common';
import { getTokenImage } from 'src/modules/token';
import { generateAstarNativeTokenObject } from 'src/modules/xcm/tokens';
import { useStore } from 'src/store';
import { computed, defineComponent, ref, watchEffect } from 'vue';
import ModalEvmWithdraw from './modals/ModalEvmWithdraw.vue';
import ModalFaucet from './modals/ModalFaucet.vue';
import ModalTransfer from './modals/ModalTransfer.vue';
import ModalVesting from './modals/ModalVesting.vue';

export default defineComponent({
  components: {
    ModalTransfer,
    ModalFaucet,
    ModalEvmWithdraw,
    ModalVesting,
  },
  props: {
    handleModalXcmBridge: {
      type: Function,
      required: true,
    },
  },
  setup() {
    const isModalTransfer = ref<boolean>(false);
    const isModalFaucet = ref<boolean>(false);
    const isModalEvmWithdraw = ref<boolean>(false);
    const isModalVesting = ref<boolean>(false);
    const bal = ref<number | null>(null);
    const balUsd = ref<number | null>(null);
    const vestingTtl = ref<number>(0);
    const lockInDappStaking = ref<number>(0);
    const isShibuya = ref<boolean>(false);
    const isFaucet = ref<boolean>(false);
    // Memo: defined by hard-coding to avoid sending too many requests to faucet API server
    // Ref: https://github.com/AstarNetwork/astar-faucet-bot/blob/main/src/clients/astar.ts#L207
    const mainnetFaucetAmount = 0.002 / 2;

    const store = useStore();
    const selectedAddress = computed(() => store.getters['general/selectedAddress']);
    const { balance, accountData } = useBalance(selectedAddress);
    const { numEvmDeposit } = useEvmDeposit();
    const { nativeTokenUsd } = usePrice();
    const nativeTokenSymbol = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      return chainInfo ? chainInfo.tokenSymbol : '';
    });

    const xcmNativeToken = computed(() => generateAstarNativeTokenObject(nativeTokenSymbol.value));

    const currentNetworkName = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      const chain = chainInfo ? chainInfo.chain : '';
      return chain === 'Shibuya Testnet' ? 'Shibuya' : chain;
    });

    const nativeTokenImg = computed(() =>
      getTokenImage({ isNativeToken: true, symbol: nativeTokenSymbol.value })
    );

    const transferableBalance = computed(() => {
      const balance = accountData.value
        ? ethers.utils.formatEther(accountData.value.getUsableTransactionBalance().toString())
        : '0';
      return Number(balance);
    });

    // Todo: enable button for ASTAR after opened channel with other parachains
    const isDisplayXcmButton = computed<boolean>(() => currentNetworkName.value === 'Shiden');

    const handleModalTransfer = ({ currency, isOpen }: { isOpen: boolean; currency: string }) => {
      isModalTransfer.value = isOpen;
    };
    const handleModalFaucet = ({ isOpen }: { isOpen: boolean }) => {
      isModalFaucet.value = isOpen;
    };
    const handleModalEvmWithdraw = ({ isOpen }: { isOpen: boolean }) => {
      isModalEvmWithdraw.value = isOpen;
    };
    const handleModalVesting = ({ isOpen }: { isOpen: boolean }) => {
      isModalVesting.value = isOpen;
    };

    watchEffect(async () => {
      const tokenSymbolRef = nativeTokenSymbol.value;
      if (!balance.value || !tokenSymbolRef) return;
      try {
        isShibuya.value = tokenSymbolRef === 'SBY';
        bal.value = Number(ethers.utils.formatEther(balance.value.toString()));
        isFaucet.value = isShibuya.value || mainnetFaucetAmount > bal.value;
        if (nativeTokenUsd.value) {
          balUsd.value = nativeTokenUsd.value * bal.value;
        } else {
          balUsd.value = 0;
        }
      } catch (error: any) {
        console.error(error.message);
      }
    });

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

    return {
      bal,
      nativeTokenSymbol,
      balUsd,
      currentNetworkName,
      numEvmDeposit,
      isShibuya,
      mainnetFaucetAmount,
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
      isDisplayXcmButton,
      handleModalVesting,
      handleModalTransfer,
      handleModalFaucet,
      handleModalEvmWithdraw,
      checkIsNullOrUndefined,
      truncate,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list.scss';
</style>
