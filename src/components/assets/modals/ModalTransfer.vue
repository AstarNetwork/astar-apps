<template>
  <astar-simple-modal :show="isModalTransfer" title="Transfer" @close="handleModalTransfer(false)">
    <div class="wrapper--modal">
      <div class="rows">
        <div class="box--input">
          <span>From</span>
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
        <div class="box--input">
          <div class="box__space-between">
            <span>To</span>
            <div>
              <span class="text--to-balance">Balance: 0 ASTR</span>
            </div>
          </div>
          <modal-select-account v-model:selAddress="toAddress" :to-address="toAddress" />
        </div>

        <div class="box--input">
          <div class="box__space-between">
            <div />
            <div class="box__available">
              <span class="text--available">Available: 0 ASTR</span>
              <button v-if="token !== tokenSymbol" class="btn--max">Max</button>
            </div>
          </div>
          <div class="box__row">
            <div class="box__row">
              <img
                width="24"
                :src="token === 'SDN' ? 'icons/sdn-token.png' : 'icons/astar.png'"
                alt="sdn"
              />
              <span class="text--title">{{ token }}</span>
            </div>
            <div class="box__column-input-amount">
              <input
                :value="amount"
                inputmode="decimal"
                type="number"
                min="0"
                pattern="^[0-9]*(\.)?[0-9]*$"
                placeholder="0.0"
                @input="inputHandler"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="box__row-button">
        <astar-action-btn>Confirm</astar-action-btn>
      </div>
    </div>
  </astar-simple-modal>
</template>
<script lang="ts">
import { useAccount, useWalletIcon } from 'src/hooks';
import { useStore } from 'src/store';
import { computed, defineComponent, ref } from 'vue';
import { getShortenAddress } from 'src/hooks/helper/addressUtils';
import ModalSelectAccount from './ModalSelectAccount.vue';

export default defineComponent({
  components: { ModalSelectAccount },
  props: {
    isModalTransfer: {
      type: Boolean,
      required: true,
    },
    handleModalTransfer: {
      type: Function,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    // accountData: {
    //   type: Object as PropType<AccountData>,
    //   required: true,
    // },
  },
  setup() {
    const amount = ref<string | null>(null);
    const toAddress = ref<string>('');
    const { iconWallet } = useWalletIcon();
    const store = useStore();
    const { currentAccount, currentAccountName } = useAccount();
    const tokenSymbol = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      return chainInfo ? chainInfo.tokenSymbol : '';
    });
    const inputHandler = (event: any): void => {
      amount.value = event.target.value;
    };
    return {
      iconWallet,
      currentAccount,
      currentAccountName,
      tokenSymbol,
      getShortenAddress,
      inputHandler,
      toAddress,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/modal-transfer.scss';
</style>
