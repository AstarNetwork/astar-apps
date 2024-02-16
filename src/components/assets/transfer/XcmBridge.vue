<template>
  <div>
    <modal-loading v-if="isLoadingApi" />
    <div class="wrapper--xcm-bridge">
      <div class="rows">
        <input-select-chain
          :chain="srcChain"
          title="from"
          :handle-display-token-selector="handleDisplayTokenSelector"
          :is-highlight-right-ui="isHighlightRightUi"
          :is-select-from="true"
          :is-selectable="isH160 ? false : true"
          :balance="String(fromAddressBalance)"
          :symbol="token.metadata.symbol"
        />
        <select-evm-wallet v-if="isDepositEthChain" :initialize-xcm-api="initializeXcmApi" />
        <div v-if="isReverseButton" class="row--reverse">
          <button class="icon--reverse cursor-pointer" @click="reverseChain">
            <astar-icon-sync size="20" />
          </button>
        </div>
        <input-select-chain
          :class="isReverseButton && 'adjust--to-input'"
          :chain="destChain"
          title="to"
          :handle-display-token-selector="handleDisplayTokenSelector"
          :is-highlight-right-ui="isHighlightRightUi"
          :is-select-from="false"
          :is-selectable="true"
          :balance="String(destAddressBalance)"
          :symbol="token.metadata.symbol"
        />
        <div v-if="isEvmBridge || isWithdrawalEthChain">
          <simple-input
            v-model:selAddress="inputtedAddress"
            :to-address="inputtedAddress"
            :placeholder="$t('evmAddressPlaceholder')"
            :is-inputting-address="isInputtingAddress"
            :toggle-is-inputting-address="toggleIsInputtingAddress"
          />
          <div v-if="isH160" class="row--withdrawal-address-format">
            <a
              href="https://docs.astar.network/docs/learn/interoperability/faq#q-where-can-i-find-other-chains-addresses"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span class="text--available">
                {{ $t('assets.modals.tipDestAddressFormat', { chain: destChain.name }) }}
              </span>
            </a>
          </div>
        </div>
        <div v-else class="row--input-address">
          <div v-if="!isInputDestAddrManually" class="row--msg-input-address">
            <div />
            <span class="text--available cursor-pointer" @click="toggleIsInputDestAddrManually">
              {{ $t('assets.transferPage.inputAddressManually') }}
            </span>
          </div>
          <div v-else>
            <simple-input
              v-model:selAddress="inputtedAddress"
              :to-address="inputtedAddress"
              :placeholder="$t('addressPlaceholder', { network: destChain.name })"
              :is-inputting-address="isInputtingAddress"
              :toggle-is-inputting-address="toggleIsInputtingAddress"
            />
            <div v-if="!isH160" class="row--msg-input-address">
              <div />
              <span class="text--available cursor-pointer" @click="toggleIsInputDestAddrManually">
                {{ $t('assets.transferPage.goBack') }}
              </span>
            </div>
          </div>
        </div>

        <div class="box--input-field box--hover--active">
          <div class="row--balance">
            <div />
            <div class="box__available">
              <span class="text--available">
                <token-balance
                  text="assets.modals.balance"
                  :balance="String(fromAddressBalance)"
                  :symbol="token.metadata.symbol"
                />
              </span>
            </div>
          </div>
          <div class="box__row">
            <div class="box__row cursor-pointer" @click="setRightUi('select-token')">
              <img width="24" alt="token-logo" class="token-logo" :src="token.tokenImage" />
              <span class="text--title">{{ token.metadata.symbol }}</span>
              <div class="icon--expand">
                <astar-icon-expand size="20" />
              </div>
            </div>
            <div class="box__column--input-amount">
              <input
                id="amount"
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
      </div>
      <div class="container--warning">
        <div class="row--warning">
          <div class="column--title">
            <span class="text--dot">・</span>
            <span class="text--warning">{{ $t('assets.modals.xcmWarning.minBalIsRequired') }}</span>
          </div>
          <div v-click-away="setIsMobileDisplayTooltip" @click="setIsMobileDisplayTooltip">
            <astar-icon-help size="20" />
            <q-tooltip
              v-model="isDisplayTooltip"
              anchor="top middle"
              :self="`bottom ${$q.platform.is.mobile ? 'end' : 'middle'}`"
              class="box--tooltip"
            >
              <div>
                <span
                  >{{
                    $t('assets.modals.xcmWarning.tooltip', {
                      amount: truncate(Number(token.minBridgeAmount), 8),
                      symbol: token.metadata.symbol,
                      network: token.originChain,
                    })
                  }}
                </span>
              </div>
            </q-tooltip>
          </div>
        </div>
        <div class="row--warning">
          <div class="column--title">
            <span class="text--dot">・</span>
            <span class="text--warning">
              {{
                $t('assets.transferPage.mintTransferAmount', {
                  amount: truncate(Number(token.minBridgeAmount), 8),
                  symbol: token.metadata.symbol,
                })
              }}
            </span>
          </div>
        </div>
        <div class="row--warning">
          <div class="column--title">
            <span class="text--dot">・</span>
            <span class="text--warning">
              {{ $t('assets.modals.xcmWarning.fee') }}
            </span>
          </div>
        </div>
        <div class="row--warning">
          <div class="column--title">
            <span class="text--dot">・</span>
            <span class="text--warning">
              {{ $t('assets.modals.xcmWarning.notInputExchanges') }}
            </span>
          </div>
        </div>
      </div>
      <div v-if="errMsg && currentAccount" class="row--box-error">
        <span class="color--white"> {{ $t(errMsg) }}</span>
      </div>
      <div class="wrapper__row--button">
        <!-- Memo: isDisabledXcmButton: XCM tab will be disabled if it is true -->
        <astar-button
          class="button--confirm btn-size-adjust"
          :disabled="isDisabledBridge || isDisabledXcmButton"
          @click="bridge"
        >
          {{ $t('confirm') }}
        </astar-button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import InputSelectChain from 'src/components/assets/transfer/InputSelectChain.vue';
import SimpleInput from 'src/components/common/SimpleInput.vue';
import SelectEvmWallet from 'src/components/assets/transfer/SelectEvmWallet.vue';
import { pathEvm, useAccount, useTooltip, useXcmBridge } from 'src/hooks';
import { truncate } from '@astar-network/astar-sdk-core';
import { Asset, ethWalletChains } from 'src/v2/models';
import { computed, defineComponent, PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import ModalLoading from '/src/components/common/ModalLoading.vue';
import { isValidEvmAddress } from '@astar-network/astar-sdk-core';
import TokenBalance from 'src/components/common/TokenBalance.vue';

export default defineComponent({
  components: {
    SimpleInput,
    InputSelectChain,
    ModalLoading,
    SelectEvmWallet,
    TokenBalance,
  },
  props: {
    setRightUi: {
      type: Function,
      required: true,
    },
    setIsSelectFromChain: {
      type: Function,
      required: true,
    },
    isHighlightRightUi: {
      type: Boolean,
      required: true,
    },
    isDisabledXcmButton: {
      type: Boolean,
      required: true,
    },
    token: {
      type: (Object as PropType<Asset>) || null,
      required: false,
      default: null,
    },
  },
  setup(props) {
    const tokenData = computed(() => props.token);
    const { t } = useI18n();
    const { isDisplayTooltip, setIsMobileDisplayTooltip } = useTooltip('icon');
    const { currentAccount } = useAccount();
    const isInputtingAddress = ref<boolean>(false);
    const toggleIsInputtingAddress = (): void => {
      isInputtingAddress.value = !isInputtingAddress.value;
    };

    const {
      amount,
      errMsg,
      srcChain,
      destChain,
      isDisabledBridge,
      isEvmBridge,
      inputtedAddress,
      isH160,
      destAddressBalance,
      fromAddressBalance,
      isDeposit,
      isLoadingApi,
      isInputDestAddrManually,
      isWithdrawalEthChain,
      initializeXcmApi,
      inputHandler,
      bridge,
      reverseChain,
      toggleIsInputDestAddrManually,
    } = useXcmBridge(tokenData);

    const isReverseButton = computed<boolean>(() => {
      if (!srcChain.value || !destChain.value || isH160.value) return false;
      return !srcChain.value.name.includes(pathEvm) && !destChain.value.name.includes(pathEvm);
    });

    const handleDisplayTokenSelector = (isFrom: boolean): void => {
      props.setRightUi('select-chain');
      props.setIsSelectFromChain(isFrom);
    };

    const getNetworkName = (): string => (isDeposit.value ? 'EVM' : destChain.value.name);

    const evmInputPlaceholder = computed<string>(() =>
      t('addressPlaceholder', { network: getNetworkName() })
    );

    const evmInputTitle = computed<string>(() => t('addressFormat', { network: getNetworkName() }));

    const isDepositEthChain = computed<boolean>(() => {
      if (!srcChain.value) return false;
      return ethWalletChains.includes(srcChain.value.name);
    });

    return {
      errMsg,
      amount,
      srcChain,
      destChain,
      isDisabledBridge,
      isEvmBridge,
      inputtedAddress,
      isLoadingApi,
      evmInputPlaceholder,
      evmInputTitle,
      isH160,
      destAddressBalance,
      fromAddressBalance,
      isDeposit,
      isDisplayTooltip,
      currentAccount,
      isInputDestAddrManually,
      isInputtingAddress,
      isReverseButton,
      isDepositEthChain,
      isWithdrawalEthChain,
      setIsMobileDisplayTooltip,
      inputHandler,
      bridge,
      truncate,
      reverseChain,
      handleDisplayTokenSelector,
      toggleIsInputDestAddrManually,
      toggleIsInputtingAddress,
      initializeXcmApi,
      isValidEvmAddress,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/xcm-bridge.scss';
</style>
