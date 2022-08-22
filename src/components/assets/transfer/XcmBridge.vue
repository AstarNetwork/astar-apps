<template>
  <div>
    <ModalLoading v-if="isLoadingApi" />
    <div class="wrapper--xcm-bridge">
      <div class="rows">
        <InputSelectChain
          :chain="srcChain"
          title="from"
          :handle-display-token-selector="handleDisplayTokenSelector"
          :is-highlight-right-ui="isHighlightRightUi"
          :is-select-from="true"
          :is-selectable="isH160 ? false : true"
        />
        <SelectEvmWallet v-if="isMoonbeamDeposit" :initialize-xcm-api="initializeXcmApi" />
        <div v-if="isReverseButton" class="row--reverse">
          <button class="icon--reverse cursor-pointer" @click="reverseChain">
            <astar-icon-sync size="20" />
          </button>
        </div>
        <InputSelectChain
          :class="isReverseButton && 'adjust--to-input'"
          :chain="destChain"
          title="to"
          :handle-display-token-selector="handleDisplayTokenSelector"
          :is-highlight-right-ui="isHighlightRightUi"
          :is-select-from="false"
          :is-selectable="true"
        />

        <div v-if="isEvmBridge">
          <AddressInputV2
            v-model:selAddress="inputtedAddress"
            :to-address="inputtedAddress"
            :is-evm="isDeposit"
            :is-display-balance="true"
            :placeholder="evmInputPlaceholder"
            :title="evmInputTitle"
            :symbol="token.metadata.symbol"
            :address-balance="inputtedAddressBalance"
          />
          <div v-if="isH160" class="row--withdrawal-address-format">
            <a
              href="https://docs.astar.network/docs/xcm/faq/#q-where-can-i-find-other-chains-addresses"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span class="text--available">
                {{ $t('assets.modals.tipDestAddressFormat', { chain: destChain.name }) }}
              </span>
            </a>
          </div>
        </div>
        <div v-else>
          <div v-if="!isInputDestAddrManually" class="row--msg-input-address">
            <div />
            <span class="text--available cursor-pointer" @click="toggleIsInputDestAddrManually">
              {{ $t('assets.transferPage.inputAddressManually') }}
            </span>
          </div>
          <div v-else>
            <AddressInputV2
              v-model:selAddress="inputtedAddress"
              :to-address="inputtedAddress"
              :is-evm="isValidEvmAddress(inputtedAddress)"
              :is-display-balance="true"
              :placeholder="$t('addressPlaceholder')"
              :title="$t('addressPlaceholder', { network: destChain.name })"
              :symbol="token.metadata.symbol"
              :address-balance="inputtedAddressBalance"
            />
            <!-- <div
              class="box--input-address"
              :class="[
                !isHighlightRightUi && 'box--hover--active',
                isInputtingAddress && 'box--active',
              ]"
            > -->
            <!-- <input
                v-model="inputtedAddress"
                class="input--address text--title"
                type="text"
                spellcheck="false"
                :placeholder="$t('destinationAddress')"
                @focus="toggleIsInputtingAddress"
                @blur="toggleIsInputtingAddress"
              /> -->
            <!-- </div> -->
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
                {{
                  $t('assets.modals.balance', {
                    amount: $n(truncate(fromAddressBalance)),
                    token: token.metadata.symbol,
                  })
                }}
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
      </div>
      <div class="container--warning">
        <div v-if="token.isNativeToken" class="row--warning">
          <div class="column--title">
            <span class="text--dot">・</span>
            <span class="text--warning">{{ $t('assets.modals.xcmWarning.minBalIsRequired') }}</span>
          </div>
          <div
            v-click-away="setIsMobileDisplayTooltip"
            class="icon--help"
            @click="setIsMobileDisplayTooltip"
          >
            <astar-icon-help size="20" />
            <q-tooltip
              v-model="isDisplayTooltip"
              anchor="top middle"
              :self="`bottom ${$q.platform.is.mobile ? 'end' : 'middle'}`"
              class="box--tooltip"
            >
              <div>
                <span v-if="existentialDeposit"
                  >{{
                    $t('assets.modals.xcmWarning.tooltip', {
                      amount: truncate(Number(existentialDeposit.originChainMinBal), 8),
                      symbol: existentialDeposit.symbol,
                      network: existentialDeposit.chain,
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
              {{ $t('assets.modals.xcmWarning.fee') }}
            </span>
          </div>
        </div>
      </div>
      <div v-if="errMsg && currentAccount" class="row--box-error">
        <span class="color--white"> {{ $t(errMsg) }}</span>
      </div>
      <div class="wrapper__row--button">
        <button
          class="btn btn--confirm btn-size-adjust"
          :disabled="isDisabledBridge"
          @click="handleBridge"
        >
          {{ $t('confirm') }}
        </button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import InputSelectChain from 'src/components/assets/transfer/InputSelectChain.vue';
import AddressInputV2 from 'src/components/common/AddressInputV2.vue';
import SelectEvmWallet from 'src/components/assets/transfer/SelectEvmWallet.vue';
import { pathEvm, useAccount, useTooltip, useXcmBridgeV2, useXcmEvm } from 'src/hooks';
import { truncate } from 'src/hooks/helper/common';
import { Asset } from 'src/v2/models';
import { computed, defineComponent, PropType, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import ModalLoading from '/src/components/common/ModalLoading.vue';
import { isValidEvmAddress } from 'src/config/web3';
export default defineComponent({
  components: {
    AddressInputV2,
    InputSelectChain,
    ModalLoading,
    SelectEvmWallet,
  },
  props: {
    handleFinalizedCallback: {
      type: Function,
      required: false,
      default: null,
    },
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
      existentialDeposit,
      isH160,
      inputtedAddressBalance,
      fromAddressBalance,
      isDeposit,
      isLoadingApi,
      isAstarNativeTransfer,
      isInputDestAddrManually,
      isMoonbeamDeposit,
      initializeXcmApi,
      inputHandler,
      bridge,
      reverseChain,
      toggleIsInputDestAddrManually,
    } = useXcmBridgeV2(tokenData);

    const isReverseButton = computed<boolean>(() => {
      if (!srcChain.value || !destChain.value || isH160.value) return false;
      return !srcChain.value.name.includes(pathEvm) && !destChain.value.name.includes(pathEvm);
    });

    const { callAssetWithdrawToPara } = useXcmEvm(tokenData);

    const handleDisplayTokenSelector = (isFrom: boolean): void => {
      props.setRightUi('select-chain');
      props.setIsSelectFromChain(isFrom);
    };

    const getNetworkName = (): string => (isDeposit.value ? 'EVM' : destChain.value.name);

    const evmInputPlaceholder = computed<string>(() => {
      return t('addressPlaceholder', { network: getNetworkName() });
    });

    const evmInputTitle = computed<string>(() => {
      return t('addressFormat', { network: getNetworkName() });
    });

    // Todo: remove async
    const finalizeCallback = async (): Promise<void> => {
      props.handleFinalizedCallback();
    };

    const handleBridge = async (): Promise<void> => {
      if (isH160.value) {
        const txHash = await callAssetWithdrawToPara(
          amount.value!!,
          inputtedAddress.value,
          finalizeCallback
        );

        if (txHash) {
          isDisabledBridge.value = true;
          amount.value = null;
        }
      } else {
        await bridge(finalizeCallback);
      }
    };

    watchEffect(() => {
      console.log('isDisabledBridge.value', isDisabledBridge.value);
      // console.log('inputtedAddress', inputtedAddress.value);
      // console.log('destChain', destChain.value);
    });

    return {
      errMsg,
      amount,
      srcChain,
      destChain,
      isDisabledBridge,
      isEvmBridge,
      inputtedAddress,
      existentialDeposit,
      isLoadingApi,
      evmInputPlaceholder,
      evmInputTitle,
      isH160,
      inputtedAddressBalance,
      fromAddressBalance,
      isDeposit,
      isDisplayTooltip,
      isAstarNativeTransfer,
      // tokenData,
      currentAccount,
      isInputDestAddrManually,
      isInputtingAddress,
      isReverseButton,
      isMoonbeamDeposit,
      // inputtedDestAddress,
      setIsMobileDisplayTooltip,
      inputHandler,
      bridge,
      // setIsNativeBridge,
      handleBridge,
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
