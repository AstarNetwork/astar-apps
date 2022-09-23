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
              }}</span
            >
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
          <div class="box__column--input-amount">
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
      <!-- Todo: update logic -->
      <SpeedConfigurationV2
        :gas-cost="nativeTipPrice"
        :selected-gas="selectedTip"
        :set-selected-gas="setSelectedTip"
      />

      <div v-if="formattedTransferFrom.isNominationTransfer" class="row--warning">
        <span>
          {{ $t('dappStaking.stakePage.nominationWarning') }}
        </span>
      </div>

      <div
        v-if="errMsg && currentAccount"
        class="row--box-error"
        :class="isRequiredCheck && 'box--margin-adjuster'"
      >
        <span class="color--white"> {{ $t(errMsg) }}</span>
      </div>
      <div class="wrapper__row--button" :class="!errMsg && 'btn-margin-adjuster'">
        <button
          class="btn btn--confirm btn-size-adjust"
          :disabled="errMsg || !Number(amount)"
          @click="transfer"
        >
          {{ $t('confirm') }}
        </button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { ethers } from 'ethers';
import SpeedConfigurationV2 from 'src/components/common/SpeedConfigurationV2.vue';
import { useAccount, useGasPrice, useNetworkInfo, useWalletIcon } from 'src/hooks';
import { getShortenAddress } from 'src/hooks/helper/addressUtils';
import { truncate } from 'src/hooks/helper/common';
import { getTokenImage } from 'src/modules/token';
import { useStore } from 'src/store';
import { computed, defineComponent, ref } from 'vue';

export default defineComponent({
  components: {
    SpeedConfigurationV2,
  },
  props: {
    dapp: {
      type: Object,
      required: true,
    },
    isEnableNominationTransfer: {
      type: Boolean,
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
  },
  setup(props) {
    const amount = ref<string | null>(null);
    const errMsg = ref<string>();
    const { iconWallet } = useWalletIcon();
    const { currentAccount, currentAccountName } = useAccount();
    const { nativeTokenSymbol } = useNetworkInfo();
    const nativeTokenImg = computed<string>(() =>
      getTokenImage({ isNativeToken: true, symbol: nativeTokenSymbol.value })
    );
    const { selectedTip, nativeTipPrice, setSelectedTip } = useGasPrice();

    const store = useStore();

    const nominationTransferMaxAmount = computed(() => {
      if (!props.formattedTransferFrom.item) return 0;
      return props.formattedTransferFrom
        ? Number(ethers.utils.formatEther(props.formattedTransferFrom.item.balance.toString()))
        : 0;
    });

    const maxAmount = computed(() => {
      if (props.isEnableNominationTransfer) {
        return String(nominationTransferMaxAmount.value);
      }

      return '0';
    });

    const toMaxAmount = (): void => {
      amount.value = maxAmount.value;
    };

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
      setSelectedTip,
      toMaxAmount,
      getShortenAddress,
      truncate,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dapp-staking/stake-manage/styles/stake-form.scss';
</style>
