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
                  <span>{{ $n(bal) }} {{ nativeTokenSymbol }}</span>
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
                  >{{ $n(transferableBalance) }} {{ nativeTokenSymbol }}</span
                >
              </div>
              <div v-else class="column__box">
                <div class="skeleton--right">
                  <q-skeleton animation="fade" class="skeleton--md" />
                </div>
              </div>
            </div>
            <div class="column--buttons">
              <button
                class="btn btn--sm"
                @click="handleModalTransfer({ isOpen: true, currency: nativeTokenSymbol })"
              >
                {{ $t('assets.transfer') }}
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
                <span class="text--value">{{ $n(numEvmDeposit) }} {{ nativeTokenSymbol }}</span>
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
                <span class="text--value">{{ $n(vestingTtl) }} {{ nativeTokenSymbol }}</span>
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
                <span class="text--value">{{ $n(lockInDappStaking) }} {{ nativeTokenSymbol }}</span>
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

    <ModalFaucet :is-modal-faucet="isModalFaucet" :handle-modal-faucet="handleModalFaucet" />
    <ModalTransfer
      :is-modal-transfer="isModalTransfer"
      :handle-modal-transfer="handleModalTransfer"
      :symbol="nativeTokenSymbol"
      :account-data="accountData"
    />
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
  </div>
</template>
<script lang="ts">
import { ethers } from 'ethers';
import { useBalance, useEvmDeposit, usePrice } from 'src/hooks';
import { useStore } from 'src/store';
import { getTokenImage } from 'src/modules/token';
import { computed, defineComponent, ref, watchEffect } from 'vue';
import ModalTransfer from './modals/ModalTransfer.vue';
import ModalFaucet from './modals/ModalFaucet.vue';
import ModalEvmWithdraw from './modals/ModalEvmWithdraw.vue';
import ModalVesting from './modals/ModalVesting.vue';
import { checkIsNullOrUndefined } from 'src/hooks/helper/common';
export default defineComponent({
  components: {
    ModalTransfer,
    ModalFaucet,
    ModalEvmWithdraw,
    ModalVesting,
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
    const mainnetFaucetAmount = 0.002;

    const store = useStore();
    const selectedAddress = computed(() => store.getters['general/selectedAddress']);
    const { balance, accountData } = useBalance(selectedAddress);
    const { numEvmDeposit } = useEvmDeposit();
    const { nativeTokenUsd } = usePrice();
    const nativeTokenSymbol = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      return chainInfo ? chainInfo.tokenSymbol : '';
    });
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
      const vesting = accountDataRef.locks.find((it) => it.toHuman().id === 'vesting ');
      const dappStake = accountDataRef.locks.find((it) => it.toHuman().id === 'dapstake');

      if (vesting) {
        const amount = String(vesting.toHuman().amount).replace(/,/g, '');
        vestingTtl.value = Number(ethers.utils.formatEther(amount));
      }
      if (dappStake) {
        const amount = String(dappStake.toHuman().amount).replace(/,/g, '');
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
      handleModalVesting,
      handleModalTransfer,
      handleModalFaucet,
      handleModalEvmWithdraw,
      checkIsNullOrUndefined,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list.scss';
</style>
