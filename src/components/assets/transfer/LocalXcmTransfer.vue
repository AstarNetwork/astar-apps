<template>
  <div v-if="token" class="wrapper--local-transfer">
    <div class="rows">
      <div class="box--input-field">
        <div class="box__space-between">
          <span> {{ $t('from') }}</span>
          <div />
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
              {{
                $t('assets.modals.balance', {
                  amount: $n(truncate(toAddressBalance)),
                  token: token.metadata.symbol,
                })
              }}
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
            <span class="text--available">
              {{
                $t('assets.modals.balance', {
                  amount: $n(truncate(token.userBalance)),
                  token: token.metadata.symbol,
                })
              }}</span
            >
            <button class="btn--max" @click="toMaxAmount">
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
              <img v-else width="24" alt="token-logo" :src="token.tokenImage" />
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

      <SpeedConfigurationV2
        :gas-cost="nativeTipPrice"
        :selected-gas="selectedTip"
        :set-selected-gas="setSelectedTip"
      />

      <div class="box--warning" :class="isChecked && 'box--warning--checked'">
        <div class="input--checkbox" :class="isChecked && 'input--checkbox--checked'">
          <input id="do-not-send-to-cex" v-model="isChecked" type="checkbox" />
          <label for="do-not-send-to-cex">
            <span :class="isChecked ? 'color--gray1' : 'color--not-checked'">{{
              $t('assets.modals.notSendToExchanges')
            }}</span>
          </label>
        </div>
      </div>
      <div v-if="errMsg && currentAccount" class="row--box-error">
        <span class="color--white"> {{ $t(errMsg) }}</span>
      </div>
      <div class="wrapper__row--button">
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
import SpeedConfigurationV2 from 'src/components/common/SpeedConfigurationV2.vue';
import { useAccount, useNetworkInfo, useWalletIcon, useXcmTokenTransfer } from 'src/hooks';
import { getShortenAddress } from 'src/hooks/helper/addressUtils';
import { truncate } from 'src/hooks/helper/common';
import { Asset } from 'src/v2/models';
import { computed, defineComponent, PropType } from 'vue';
import Jazzicon from 'vue3-jazzicon/src/components';

export default defineComponent({
  components: {
    InputSelectAccount,
    SpeedConfigurationV2,
    [Jazzicon.name]: Jazzicon,
  },
  props: {
    accountData: {
      type: Object,
      required: false,
      default: null,
    },
    handleFinalizedCallback: {
      type: Function,
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
      toAddress,
      errMsg,
      isDisabledTransfer,
      isChecked,
      inputHandler,
      setSelectedTip,
      transferAsset,
      toMaxAmount,
    } = useXcmTokenTransfer(t);

    // Todo: remove async
    const finalizeCallback = async (): Promise<void> => {
      props.handleFinalizedCallback();
    };

    const transfer = async (): Promise<void> => {
      await transferAsset({
        transferAmt: Number(transferAmt.value),
        toAddress: toAddress.value,
        finalizeCallback,
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
      selectedTip,
      nativeTipPrice,
      isChecked,
      setSelectedTip,
      transfer,
      toMaxAmount,
      getShortenAddress,
      inputHandler,
      truncate,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/local-transfer.scss';
</style>
