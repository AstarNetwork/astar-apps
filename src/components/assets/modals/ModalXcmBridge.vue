<template>
  <astar-simple-modal
    :show="isModalXcmBridge"
    :title="$t('assets.modals.xcmBridge')"
    :is-closing="isClosingModal"
    @close="closeModal"
  >
    <div v-if="token" class="wrapper--modal">
      <div class="rows">
        <div class="box--input-chain">
          <div class="box__space-between">
            <span> {{ $t('from') }}</span>
            <div />
          </div>
          <div class="row__chain">
            <img :src="chainIcon.src" alt="src-chain-logo" class="logo" />
            <span class="text--xl"> {{ chainName.src }} </span>
          </div>
        </div>
        <div class="box--input-chain">
          <div class="box__space-between">
            <span> {{ $t('to') }}</span>
            <div />
          </div>
          <div class="row__chain">
            <img :src="chainIcon.dest" alt="src-chain-logo" class="logo" />
            <span class="text--xl"> {{ chainName.dest }} </span>
          </div>
        </div>

        <div class="box--input box--hover--active">
          <div class="box__space-between">
            <div />
            <div class="box__available">
              <span class="text--available">
                {{
                  $t('assets.modals.balance', {
                    amount: $n(Number(formattedSelectedTokenBalance)),
                    token: String(token.metadata.symbol),
                  })
                }}</span
              >
              <button v-if="!isNativeToken" class="btn--max" @click="toMaxAmount">
                {{ $t('assets.modals.max') }}
              </button>
            </div>
          </div>
          <div class="box__row">
            <div class="box__row">
              <img width="24" alt="token-logo" :src="tokenImage" />
              <span class="text--title">{{ String(token.metadata.symbol) }}</span>
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
      <div class="wrapper__row--button">
        <button class="btn btn--confirm" :disabled="isDisabledBridge" @click="transfer">
          {{ $t('confirm') }}
        </button>
      </div>
    </div>
  </astar-simple-modal>
</template>
<script lang="ts">
import { fadeDuration } from '@astar-network/astar-ui';
import { ChainAsset, useXcmBridge } from 'src/hooks';
import { wait } from 'src/hooks/helper/common';
import { computed, defineComponent, PropType, ref } from 'vue';

export default defineComponent({
  components: {},
  props: {
    isModalXcmBridge: {
      type: Boolean,
      required: false,
      default: false,
    },
    handleModalXcmBridge: {
      type: Function,
      required: true,
    },
    token: {
      type: (Object as PropType<ChainAsset>) || null,
      required: false,
      default: null,
    },
  },
  setup(props) {
    const isClosingModal = ref<boolean>(false);

    // const selectedToken = computed(() => store.getters['xcm/selectedToken']);
    const token = computed(() => props.token);

    const {
      errMsg,
      amount,
      chainIcon,
      chainName,
      isDisabledBridge,
      formattedSelectedTokenBalance,
      tokenImage,
      isNativeToken,
      inputHandler,
      bridge,
      toMaxAmount,
      resetStates,
    } = useXcmBridge(token);

    const closeModal = async (): Promise<void> => {
      isClosingModal.value = true;
      resetStates();
      await wait(fadeDuration);
      props.handleModalXcmBridge({ isOpen: false, currency: null });
      isClosingModal.value = false;
    };

    return {
      errMsg,
      isClosingModal,
      amount,
      chainIcon,
      chainName,
      isDisabledBridge,
      tokenImage,
      isNativeToken,
      formattedSelectedTokenBalance,
      inputHandler,
      closeModal,
      bridge,
      toMaxAmount,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/modal-xcm-bridge.scss';
</style>
