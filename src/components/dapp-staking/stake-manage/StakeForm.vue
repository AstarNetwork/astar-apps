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
              placeholder="0.0"
              class="input--amount input--no-spin"
              @input="inputHandler"
            />
          </div>
        </div>
      </div>

      <div class="separator" />
      <speed-configuration
        :gas-cost="nativeTipPrice"
        :selected-gas="selectedTip"
        :set-selected-gas="setSelectedTip"
      />

      <div class="row--box-warning">
        <div class="column--title">
          <span class="text--dot">・</span>
          <span> {{ $t(warningMsg) }}</span>
        </div>
      </div>
      <div v-if="errMsg && currentAccount" class="row--box-error">
        <span class="color--white"> {{ $t(errMsg) }}</span>
      </div>
      <div class="wrapper__row--button" :class="!errMsg && 'btn-margin-adjuster'">
        <astar-button
          class="btn-size--confirm"
          :disabled="errMsg || !Number(amount)"
          @click="handleStake({ amount, targetContractId: dapp.dapp.address })"
        >
          <span class="text--btn-confirm">
            {{ $t('confirm') }}
          </span>
        </astar-button>
      </div>
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
    const { selectedTip, nativeTipPrice, setSelectedTip } = useGasPrice();
    const warningMsg = t('dappStaking.error.warningLeaveMinAmount', {
      symbol: nativeTokenSymbol.value,
    });

    const inputHandler = (event: any): void => {
      amount.value = event.target.value;
    };

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
      // MEMO: it leave 10ASTR in the account so it will keep the balance for longer period.
      const leaveAmount = ethers.utils.parseEther('10');
      amount.value = truncate(
        ethers.utils.formatEther(maximumAmount.sub(leaveAmount).toString())
      ).toString();
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

      const formatInputAmount = ethers.utils.parseEther(inputAmount.toString());
      const maximumAmount = ethers.utils.parseEther(maxAmount.value);
      const leaveAmount = ethers.utils.parseEther('10');

      if (!inputAmount) {
        return '';
      }

      if (isNotEnoughMinAmount || maximumAmount.sub(formatInputAmount).lte(leaveAmount)) {
        return t('dappStaking.error.notEnoughMinAmount', {
          amount: formattedMinStaking.value,
          symbol: nativeTokenSymbol.value,
        });
      }

      const formattedTransferFromRef = props.formattedTransferFrom;
      const isNominationTransfer = formattedTransferFromRef.isNominationTransfer;

      if (isNominationTransfer && formattedTransferFromRef.item) {
        const balTransferFrom = Number(
          ethers.utils.formatEther(formattedTransferFromRef.item.balance.toString())
        );
        const targetBalAfterTransfer = balTransferFrom - inputAmount;

        if (inputAmount >= balTransferFrom) {
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
      warningMsg,
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
