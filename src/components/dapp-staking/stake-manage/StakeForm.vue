<template>
  <div class="wrapper--stake">
    <div class="rows">
      <div class="row--dapp-name">
        <img width="32" alt="dapp-logo" :src="dapp.dapp.iconUrl" />
        <span class="text--dapp-name"> {{ dapp.dapp.name }} </span>
      </div>
      <div class="box--input-field">
        <div class="box__space-between">
          <span> {{ $t('dappStaking.stakePage.whereFundsFrom') }}</span>
        </div>
        <div class="box__row cursor-pointer" @click="setRightUi('select-funds-from')">
          <div class="token-logo">
            <img width="24" alt="token-logo" :src="formattedTransferFrom.item.iconUrl" />
          </div>
          <div class="column--funds">
            <span v-if="formattedTransferFrom" class="text--funds">{{
              formattedTransferFrom.text
            }}</span>
          </div>
          <div class="icon--expand">
            <astar-icon-expand size="20" />
          </div>
        </div>
      </div>

      <div class="box--input-field box--hover--active">
        <div class="box__space-between">
          <div />
          <div class="box__available">
            <span class="text--to--balance">
              {{
                $t('assets.modals.balance', {
                  amount: $n(truncate(maxAmount)),
                  token: nativeTokenSymbol,
                })
              }}
            </span>
            <button class="btn--max" @click="toMaxAmount">
              {{ $t('assets.modals.max') }}
            </button>
          </div>
        </div>
        <div class="box__row">
          <div class="box__row">
            <div class="token-logo">
              <img width="24" alt="token-logo" :src="nativeTokenImg" />
            </div>
            <span class="text--title">{{ nativeTokenSymbol }}</span>
          </div>
          <div>
            <input
              :value="amount"
              inputmode="decimal"
              type="number"
              min="0"
              pattern="^[0-9]*(\.)?[0-9]*$"
              placeholder="0"
              class="input--amount input--no-spin"
              @input="inputHandler"
            />
          </div>
        </div>
      </div>

      <div v-if="isEnableSpeedConfiguration" class="separator" />
      <speed-configuration
        v-if="isEnableSpeedConfiguration"
        :gas-cost="nativeTipPrice"
        :selected-gas="selectedTip"
        :set-selected-gas="setSelectedTip"
      />

      <div class="row--box-warning">
        <div class="column--title">
          <span class="text--dot">・</span>
          <span> {{ $t(warningMinAmtMsg) }}</span>
        </div>
      </div>
      <div v-if="errMsg && currentAccount" class="row--box-error">
        <span class="color--white"> {{ $t(errMsg) }}</span>
      </div>
      <div v-if="warningMsg && currentAccount" class="row--box-error">
        <span class="color--white"> {{ $t(warningMsg) }}</span>
      </div>
      <astar-button
        class="btn-size--confirm"
        :disabled="!!errMsg || !Number(amount)"
        @click="handleStake({ amount, targetContractId: dapp.dapp.address })"
      >
        <span class="text--btn-confirm">
          {{ $t('confirm') }}
        </span>
      </astar-button>
    </div>
  </div>
</template>
<script lang="ts">
import { getShortenAddress, truncate } from '@astar-network/astar-sdk-core';
import { ethers } from 'ethers';
import SpeedConfiguration from 'src/components/common/SpeedConfiguration.vue';
import {
  useAccount,
  useGasPrice,
  useGetMinStaking,
  useNetworkInfo,
  useWalletIcon,
} from 'src/hooks';
import { getTokenImage } from 'src/modules/token';
import { useStore } from 'src/store';
import { computed, defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  components: {
    SpeedConfiguration,
  },
  props: {
    dapp: {
      type: Object,
      required: true,
    },
    formattedTransferFrom: {
      type: Object,
      required: false,
      default: null,
    },
    setRightUi: {
      type: Function,
      required: true,
    },
    handleStake: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const amount = ref<string | null>(null);
    const { iconWallet } = useWalletIcon();
    const { t } = useI18n();
    const { currentAccount, currentAccountName } = useAccount();
    const { nativeTokenSymbol } = useNetworkInfo();
    const { minStaking } = useGetMinStaking();
    const nativeTokenImg = computed<string>(() =>
      getTokenImage({ isNativeToken: true, symbol: nativeTokenSymbol.value })
    );
    const { selectedTip, nativeTipPrice, setSelectedTip, isEnableSpeedConfiguration } =
      useGasPrice();

    // MEMO: it leave 10ASTR in the account so it will keep the balance for longer period.
    const leaveAmountNum = computed<number>(() => {
      return nativeTokenSymbol.value === 'ASTR' ? 10 : 1;
    });

    const warningMinAmtMsg = t('dappStaking.error.warningLeaveMinAmount', {
      symbol: nativeTokenSymbol.value,
      amount: leaveAmountNum.value,
    });

    const inputHandler = (event: any): void => {
      amount.value = event.target.value;
    };

    const leaveAmount = computed<ethers.BigNumber>(() => {
      const isNominationTransfer = props.formattedTransferFrom.isNominationTransfer;
      return ethers.utils.parseEther(isNominationTransfer ? '0' : String(leaveAmountNum.value));
    });

    const maxAmount = computed<string>(() => {
      if (!props.formattedTransferFrom.item) return '0';
      return String(
        props.formattedTransferFrom
          ? ethers.utils.formatEther(props.formattedTransferFrom.item.balance.toString())
          : '0'
      );
    });

    const toMaxAmount = (): void => {
      const maximumAmount = ethers.utils.parseEther(maxAmount.value);
      const rawMaximumAmount = truncate(ethers.utils.formatEther(maximumAmount));
      const amt = truncate(
        ethers.utils.formatEther(maximumAmount.sub(leaveAmount.value).toString())
      );

      amount.value = String(amt > 0 ? amt : rawMaximumAmount);
    };

    const formattedMinStaking = computed<number>(() => {
      return Number(ethers.utils.formatEther(minStaking.value).toString());
    });

    const errMsg = computed<string>(() => {
      const stakedAmount = props.dapp.stakerInfo.accountStakingAmount
        ? Number(props.dapp.stakerInfo.accountStakingAmount)
        : 0;
      const inputAmount = Number(amount.value);
      const stakingAmount = inputAmount + stakedAmount;
      const isNotEnoughMinAmount = formattedMinStaking.value > stakingAmount;
      const isNominationTransfer = props.formattedTransferFrom.isNominationTransfer;

      if (!inputAmount) {
        return '';
      }

      if (inputAmount > Number(maxAmount.value)) {
        return t('warning.insufficientBalance', {
          token: nativeTokenSymbol.value,
        });
      }

      if (!isNominationTransfer && leaveAmountNum.value > Number(maxAmount.value) - inputAmount) {
        return t('dappStaking.error.warningLeaveMinAmount', {
          symbol: nativeTokenSymbol.value,
          amount: leaveAmountNum.value,
        });
      }

      if (isNotEnoughMinAmount) {
        return t('dappStaking.error.notEnoughMinAmount', {
          amount: formattedMinStaking.value,
          symbol: nativeTokenSymbol.value,
        });
      }

      return '';
    });

    const warningMsg = computed<string>(() => {
      const inputAmount = Number(amount.value);
      const formattedTransferFromRef = props.formattedTransferFrom;
      const isNominationTransfer = formattedTransferFromRef.isNominationTransfer;
      if (isNominationTransfer && formattedTransferFromRef.item) {
        const balTransferFrom = Number(
          ethers.utils.formatEther(formattedTransferFromRef.item.balance.toString())
        );

        const targetBalAfterTransfer = balTransferFrom - inputAmount;

        // Memo: 0.1: no need to display the warning message if the balance is less than 0.1ASTR
        if (inputAmount >= balTransferFrom || 0.1 > targetBalAfterTransfer) {
          return '';
        } else if (formattedMinStaking.value > targetBalAfterTransfer) {
          return t('dappStaking.error.allFundsWillBeTransferred', {
            minStakingAmount: formattedMinStaking.value,
            symbol: nativeTokenSymbol.value,
          });
        }
      }
      return '';
    });

    return {
      iconWallet,
      currentAccount,
      currentAccountName,
      nativeTokenSymbol,
      selectedTip,
      nativeTipPrice,
      nativeTokenImg,
      amount,
      errMsg,
      maxAmount,
      warningMinAmtMsg,
      warningMsg,
      isEnableSpeedConfiguration,
      setSelectedTip,
      toMaxAmount,
      getShortenAddress,
      truncate,
      inputHandler,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dapp-staking/stake-manage/styles/stake-form.scss';
</style>
