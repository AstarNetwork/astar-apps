<template>
  <div v-if="token" class="wrapper--local-transfer">
    <div class="rows">
      <div class="box--input-field">
        <div class="box__space-between">
          <span> {{ $t('from') }}</span>
          <div>
            <span class="text--to--balance">
              <TokenBalance
                text="assets.modals.balance"
                :balance="String(fromAddressBalance)"
                :symbol="token.metadata.symbol"
              />
            </span>
          </div>
        </div>
        <div class="box__row">
          <img v-if="iconWallet" width="24" :src="iconWallet" alt="wallet-icon" />
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
              <TokenBalance
                text="assets.modals.balance"
                :balance="String(toAddressBalance)"
                :symbol="token.metadata.symbol"
              />
            </span>
          </div>
        </div>
        <InputSelectAccount
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
              <TokenBalance
                text="assets.modals.balance"
                :balance="String(fromAddressBalance)"
                :symbol="token.metadata.symbol"
              />
            </span>
            <button v-if="!isTransferNativeToken" class="btn--max" @click="toMaxAmount">
              {{ $t('assets.modals.max') }}
            </button>
          </div>
        </div>
        <div class="box__row">
          <div class="box__row cursor-pointer" @click="setRightUi('select-token')">
            <div class="token-logo">
              <jazzicon
                v-if="token.tokenImage.includes('custom-token')"
                :address="token.id"
                :diameter="24"
              />
              <img
                v-else
                width="24"
                alt="token-logo"
                :src="token.tokenImage"
                :class="token.metadata.symbol === nativeTokenSymbol && 'token-native-adjustment'"
              />
            </div>
            <span class="text--title">{{ token.metadata.symbol }}</span>
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
              placeholder="0.0"
              class="input--amount input--no-spin"
              @input="inputHandler"
            />
          </div>
        </div>
      </div>

      <div class="separator" />

      <speed-configuration
        v-if="isEnableSpeedConfiguration"
        :gas-cost="isH160 ? evmGasCost : nativeTipPrice"
        :selected-gas="isH160 ? selectedGas : selectedTip"
        :set-selected-gas="isH160 ? setSelectedGas : setSelectedTip"
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
        <button
          class="btn btn--confirm btn-size-adjust"
          :disabled="isDisabledTransfer"
          @click="transfer"
        >
          {{ $t('confirm') }}
        </button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import InputSelectAccount from 'src/components/assets/transfer/InputSelectAccount.vue';
import SpeedConfiguration from 'src/components/common/SpeedConfiguration.vue';
import { SupportWallet } from 'src/config/wallets';
import { useAccount, useNetworkInfo, useWalletIcon, useTokenTransfer } from 'src/hooks';
import { getShortenAddress } from 'src/hooks/helper/addressUtils';
import { useStore } from 'src/store';
import { Asset } from 'src/v2/models';
import { computed, defineComponent, PropType } from 'vue';
import Jazzicon from 'vue3-jazzicon/src/components';
import TokenBalance from 'src/components/common/TokenBalance.vue';

export default defineComponent({
  components: {
    InputSelectAccount,
    SpeedConfiguration,
    [Jazzicon.name]: Jazzicon,
    TokenBalance,
  },
  props: {
    accountData: {
      type: Object,
      required: false,
      default: null,
    },
    setRightUi: {
      type: Function,
      required: true,
    },
    token: {
      type: Object as PropType<Asset>,
      required: true,
    },
  },
  setup(props) {
    const { iconWallet } = useWalletIcon();
    const { currentAccount, currentAccountName } = useAccount();
    const { nativeTokenSymbol } = useNetworkInfo();
    const t = computed<Asset>(() => props.token);
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
      selectedGas,
      evmGasCost,
      isTransferNativeToken,
      setSelectedGas,
      inputHandler,
      setSelectedTip,
      transferAsset,
      toMaxAmount,
    } = useTokenTransfer(t);

    const store = useStore();
    const isEnableSpeedConfiguration = computed<boolean>(() => {
      const currentWallet = store.getters['general/currentWallet'];
      return (
        currentWallet !== SupportWallet.TalismanEvm && currentWallet !== SupportWallet.SubWalletEvm
      );
    });

    const transfer = async (): Promise<void> => {
      await transferAsset({
        transferAmt: Number(transferAmt.value),
        toAddress: toAddress.value,
      });
    };

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
      evmGasCost,
      nativeTipPrice,
      selectedGas,
      selectedTip,
      isH160,
      isRequiredCheck,
      isTransferNativeToken,
      setSelectedGas,
      setSelectedTip,
      transfer,
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
