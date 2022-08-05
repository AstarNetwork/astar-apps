<template>
  <div class="">
    <!-- <ModalLoading v-if="isLoadingApi" /> -->

    <div v-if="isReady" class="wrapper--xcm-bridge">
      <div class="rows">
        <div class="box--input-chain" :class="isNativeBridge && 'box--hover--active'">
          <div class="box__space-between">
            <span> {{ $t('from') }}</span>
            <div />
          </div>
          <!-- Memo: one way bridge for 'from / to' EVM account -->
          <ModalSelectChain
            :chains="chains"
            :chain="srcChain"
            :set-chain="setSrcChain"
            :is-enable-set-chain="isNativeBridge"
          />
        </div>
        <div class="box--input-chain" :class="isNativeBridge && 'box--hover--active'">
          <div class="box__space-between">
            <span> {{ $t('to') }}</span>
            <div />
          </div>
          <ModalSelectChain
            :chains="chains"
            :chain="destChain"
            :set-chain="setDestChain"
            :is-enable-set-chain="isNativeBridge"
          />
        </div>

        <div v-if="!isNativeBridge">
          <AddressInputV2
            v-model:selAddress="evmDestAddress"
            :to-address="evmDestAddress"
            :is-evm="isDeposit"
            :is-display-balance="true"
            :placeholder="evmInputPlaceholder"
            :title="evmInputTitle"
            :symbol="tokenData.metadata.symbol"
            :address-balance="evmDestAddressBalance"
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

        <div class="box--input-field box--hover--active">
          <div class="box__space-between">
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
            <div class="box__row">
              <img width="24" alt="token-logo" class="token-logo" :src="token.tokenImage" />
              <span class="text--title">{{ token.metadata.symbol }}</span>
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
      <div v-if="errMsg" class="row--box-error">
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
import { fadeDuration } from '@astar-network/astar-ui';
import ModalSelectChain from 'src/components/assets/modals/ModalSelectChain.vue';
import AddressInputV2 from 'src/components/common/AddressInputV2.vue';
import { useTooltip, useXcmBridge, useXcmEvm } from 'src/hooks';
import { Asset } from 'src/v2/models';
import { truncate, wait } from 'src/hooks/helper/common';
import { computed, defineComponent, PropType, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
// import ModalLoading from '/src/components/common/ModalLoading.vue';

export default defineComponent({
  components: {
    AddressInputV2,
    ModalSelectChain,
    // ModalLoading,
  },
  props: {
    // handleUpdateXcmTokenBalances: {
    //   type: Function,
    //   required: true,
    // },
    token: {
      type: (Object as PropType<Asset>) || null,
      required: false,
      default: null,
    },
  },
  setup(props) {
    const isClosingModal = ref<boolean>(false);
    const tokenData = computed(() => props.token);
    const { t } = useI18n();
    const { isDisplayTooltip, setIsMobileDisplayTooltip } = useTooltip('icon');

    const {
      amount,
      errMsg,
      srcChain,
      destChain,
      isDisabledBridge,
      isNativeBridge,
      evmDestAddress,
      existentialDeposit,
      chains,
      isH160,
      evmDestAddressBalance,
      fromAddressBalance,
      isDeposit,
      isLoadingApi,
      isAstarNativeTransfer,
      inputHandler,
      bridge,
      resetStates,
      setIsNativeBridge,
      setSrcChain,
      setDestChain,
    } = useXcmBridge(tokenData);

    const { callAssetWithdrawToPara } = useXcmEvm(tokenData);

    const isReady = computed<boolean>(() => {
      return !!(tokenData.value && srcChain.value && destChain.value);
    });

    const getNetworkName = (): string => (isDeposit.value ? 'EVM' : destChain.value.name);

    const evmInputPlaceholder = computed<string>(() => {
      return t('addressPlaceholder', { network: getNetworkName() });
    });

    const evmInputTitle = computed<string>(() => {
      return t('addressFormat', { network: getNetworkName() });
    });

    const closeModal = async (): Promise<void> => {
      isClosingModal.value = true;
      resetStates();
      await wait(fadeDuration);
      // props.handleModalXcmBridge({ isOpen: false, currency: null });
      isClosingModal.value = false;
    };

    const handleBridge = async (): Promise<void> => {
      if (isH160.value) {
        const txHash = await callAssetWithdrawToPara(
          amount.value!!,
          evmDestAddress.value,
          closeModal
        );

        if (txHash) {
          isDisabledBridge.value = true;
          amount.value = null;
        }
      } else {
        await bridge(closeModal);
        // await props.handleUpdateXcmTokenBalances();
      }
    };

    watchEffect(() => {
      console.log('token', props.token);
      // console.log('isReady', isReady.value);
      // console.log('tokenData', tokenData.value);
    });

    return {
      errMsg,
      isClosingModal,
      amount,
      srcChain,
      destChain,
      isDisabledBridge,
      isNativeBridge,
      evmDestAddress,
      existentialDeposit,
      isLoadingApi,
      isReady,
      chains,
      evmInputPlaceholder,
      evmInputTitle,
      isH160,
      evmDestAddressBalance,
      fromAddressBalance,
      isDeposit,
      isDisplayTooltip,
      isAstarNativeTransfer,
      tokenData,
      setIsMobileDisplayTooltip,
      inputHandler,
      closeModal,
      bridge,
      setIsNativeBridge,
      handleBridge,
      truncate,
      setSrcChain,
      setDestChain,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/xcm-bridge.scss';
</style>
