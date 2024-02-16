<template>
  <div v-if="token" class="wrapper--local-transfer">
    <div class="rows">
      <div class="box--input-field">
        <div class="box__space-between">
          <span> {{ $t('from') }}</span>
          <div>
            <span class="text--to--balance">
              <token-balance
                text="assets.modals.balance"
                :balance="String(fromAddressBalance)"
                :symbol="token.symbol"
              />
            </span>
          </div>
        </div>
        <div class="box__row">
          <img
            v-if="iconWallet"
            width="24"
            :src="iconWallet"
            alt="wallet-icon"
            :class="multisig && 'img--polkasafe'"
          />
          <div class="column--wallet-address">
            <div class="column--wallet-name">
              <span class="text--title">{{ currentAccountName }}</span>
            </div>
            <span class="text--title">{{ getShortenAddress(currentAccount) }}</span>
          </div>
        </div>
      </div>
      <div class="box--input-field box--hover--active">
        <div class="box__space-between">
          <span> {{ $t('to') }}</span>
          <div>
            <span class="text--to--balance">
              <token-balance
                text="assets.modals.balance"
                :balance="String(toAddressBalance)"
                :symbol="token.symbol"
              />
            </span>
          </div>
        </div>
        <input-select-account
          v-model:selAddress="toAddress"
          :to-address="toAddress"
          :is-erc20-transfer="false"
        />
      </div>

      <div class="box--input-field box--hover--active">
        <div class="box__space-between">
          <div />
          <div class="box__available">
            <span class="text--to--balance">
              <token-balance
                text="assets.modals.balance"
                :balance="String(fromAddressBalance)"
                :symbol="token.symbol"
              />
            </span>
            <button class="btn--max" @click="toMaxAmount">
              {{ $t('assets.modals.max') }}
            </button>
          </div>
        </div>
        <div class="box__row">
          <div class="box__row cursor-pointer" @click="setRightUi('select-token')">
            <div class="token-logo">
              <jazzicon :address="token.address" :diameter="24" />
            </div>
            <span class="text--title">{{ token.symbol }}</span>
            <div class="icon--expand">
              <astar-icon-expand size="20" />
            </div>
          </div>
          <div class="box__column--input-amount">
            <input
              :value="transferAmt"
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

      <div class="separator" />

      <speed-configuration
        v-if="isEnableSpeedConfiguration"
        :gas-cost="nativeTipPrice"
        :selected-gas="selectedTip"
        :set-selected-gas="setSelectedTip"
      />

      <div
        v-if="isRequiredCheck"
        class="box--warning"
        :class="isChecked && 'box--warning--checked'"
      >
        <div class="input--checkbox" :class="isChecked && 'input--checkbox--checked'">
          <input id="do-not-send-to-cex" v-model="isChecked" type="checkbox" />
          <label for="do-not-send-to-cex">
            <span :class="isChecked ? 'color--gray1' : 'color--not-checked'">{{
              $t('assets.modals.notSendToExchanges')
            }}</span>
          </label>
        </div>
      </div>
      <div
        v-if="errMsg && currentAccount"
        class="row--box-error"
        :class="isRequiredCheck && 'box--margin-adjuster'"
      >
        <span class="color--white"> {{ $t(errMsg) }}</span>
      </div>
      <div class="wrapper__row--button" :class="!errMsg && 'btn-margin-adjuster'">
        <astar-button
          class="button--confirm btn-size-adjust"
          :disabled="isDisabledTransfer"
          @click="transferAsset"
        >
          {{ $t('confirm') }}
        </astar-button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import InputSelectAccount from 'src/components/assets/transfer/InputSelectAccount.vue';
import SpeedConfiguration from 'src/components/common/SpeedConfiguration.vue';
import TokenBalance from 'src/components/common/TokenBalance.vue';
import { useAccount, useNetworkInfo, useWalletIcon, useXvmTokenTransfer } from 'src/hooks';
import { getShortenAddress } from '@astar-network/astar-sdk-core';
import { Erc20Token } from 'src/modules/token';
import { computed, defineComponent, PropType } from 'vue';
import Jazzicon from 'vue3-jazzicon/src/components';

export default defineComponent({
  components: {
    InputSelectAccount,
    SpeedConfiguration,
    [Jazzicon.name]: Jazzicon,
    TokenBalance,
  },
  props: {
    setRightUi: {
      type: Function,
      required: true,
    },
    token: {
      type: Object as PropType<Erc20Token>,
      required: true,
    },
  },
  setup(props) {
    const { iconWallet } = useWalletIcon();
    const { currentAccount, currentAccountName, multisig } = useAccount();
    const { nativeTokenSymbol } = useNetworkInfo();
    const t = computed<Erc20Token>(() => props.token);
    const {
      selectedTip,
      nativeTipPrice,
      transferAmt,
      toAddressBalance,
      fromAddressBalance,
      toAddress,
      errMsg,
      isDisabledTransfer,
      isChecked,
      isH160,
      isRequiredCheck,
      isEnableSpeedConfiguration,
      inputHandler,
      setSelectedTip,
      transferAsset,
      toMaxAmount,
    } = useXvmTokenTransfer(t);

    return {
      iconWallet,
      currentAccount,
      currentAccountName,
      nativeTokenSymbol,
      toAddress,
      toAddressBalance,
      transferAmt,
      errMsg,
      isDisabledTransfer,
      fromAddressBalance,
      isChecked,
      isEnableSpeedConfiguration,
      nativeTipPrice,
      selectedTip,
      isH160,
      isRequiredCheck,
      multisig,
      setSelectedTip,
      transferAsset,
      toMaxAmount,
      getShortenAddress,
      inputHandler,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/local-transfer.scss';
</style>
