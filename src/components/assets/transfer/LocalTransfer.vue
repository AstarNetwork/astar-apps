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
                :symbol="token.metadata.symbol"
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
                :symbol="token.metadata.symbol"
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
                :address="token.mappedERC20Addr"
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

      <div
        v-if="isRequiredCheck"
        class="box--warning"
        :class="isChecked && 'box--warning--checked'"
      >
        <div class="input--checkbox" :class="isChecked && 'input--checkbox--checked'">
          <input id="do-not-send-to-cex" v-model="isChecked" type="checkbox" />
          <label for="do-not-send-to-cex">
            <div class="column--warning">
              <div v-if="isNativeToEvm" class="row--warning-title">
                <div class="icon--warning">
                  <astar-icon-warning size="20" />
                </div>
                <span
                  class="text--title-evm-warning"
                  :class="isChecked ? 'color--gray1' : 'color--not-checked'"
                >
                  {{ $t('warning.warning') }}
                </span>
              </div>
              <span
                v-if="isNativeToEvm"
                :class="isChecked ? 'color--gray1' : 'color--not-checked'"
                class="text--evm-warning"
              >
                {{ $t('assets.modals.notSendToEvmExchanges') }}
              </span>
              <span v-else-if="!isH160" :class="isChecked ? 'color--gray1' : 'color--not-checked'">
                {{ $t('assets.modals.notSendToExchanges') }}
              </span>
            </div>
            <span
              v-if="isZkEvm || (isH160 && !isNativeToEvm)"
              :class="isChecked ? 'color--gray1' : 'color--not-checked'"
            >
              <div class="row--warning-title">
                <div class="icon--warning">
                  <astar-icon-warning size="20" />
                </div>
                <span
                  class="text--title-evm-warning"
                  :class="isChecked ? 'color--gray1' : 'color--not-checked'"
                >
                  {{ $t('warning.warning') }}
                </span>
              </div>
              <ul class="column--warnings">
                <li>
                  <span>
                    {{ $t('assets.modals.notSendToExchanges') }}
                  </span>
                </li>
                <li v-if="!isSupportAuTransfer">
                  <span>
                    {{ $t('assets.modals.cannotBeSentErc20', { network: currentNetworkName }) }}
                  </span>
                </li>
                <li>
                  <span>
                    {{ $t('assets.modals.understandWarning') }}
                  </span>
                </li>
              </ul>
            </span>
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
          @click="transfer"
        >
          {{ $t('confirm') }}
        </astar-button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { getShortenAddress, isValidEvmAddress } from '@astar-network/astar-sdk-core';
import InputSelectAccount from 'src/components/assets/transfer/InputSelectAccount.vue';
import SpeedConfiguration from 'src/components/common/SpeedConfiguration.vue';
import TokenBalance from 'src/components/common/TokenBalance.vue';
import { useAccount, useNetworkInfo, useTokenTransfer, useWalletIcon } from 'src/hooks';
import { Asset } from 'src/v2/models';
import { PropType, computed, defineComponent } from 'vue';
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
      type: Object as PropType<Asset>,
      required: true,
    },
  },
  setup(props) {
    const { iconWallet } = useWalletIcon();
    const { currentAccount, currentAccountName, multisig, isLockdropAccount } = useAccount();
    const { nativeTokenSymbol, currentNetworkName, isSupportAuTransfer, isZkEvm } =
      useNetworkInfo();
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
      isTransferNativeToken,
      isEnableSpeedConfiguration,
      inputHandler,
      setSelectedTip,
      transferAsset,
      toMaxAmount,
    } = useTokenTransfer(t);

    const isNativeToEvm = computed<boolean>(
      () => !isH160.value && isValidEvmAddress(toAddress.value)
    );

    const transfer = async (): Promise<void> => {
      await transferAsset({
        transferAmt: Number(transferAmt.value),
        toAddress: toAddress.value,
        symbol: props.token.metadata.symbol,
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
      nativeTipPrice,
      selectedTip,
      isH160,
      isRequiredCheck,
      isTransferNativeToken,
      isNativeToEvm,
      multisig,
      isZkEvm,
      currentNetworkName,
      isSupportAuTransfer,
      isLockdropAccount,
      isValidEvmAddress,
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
