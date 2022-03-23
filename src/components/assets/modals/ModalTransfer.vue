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
              <span class="text--to-balance">
                {{ $t('assets.modals.balance', { amount: $n(toAddressBalance), token }) }}
              </span>
            </div>
          </div>
          <modal-select-account v-model:selAddress="toAddress" :to-address="toAddress" />
        </div>

        <div class="box--input">
          <div class="box__space-between">
            <div />
            <div class="box__available">
              <span class="text--available">
                {{ $t('assets.modals.balance', { amount: $n(fromAddressBalance), token }) }}</span
              >
              <button v-if="token !== tokenSymbol" class="btn--max">
                {{ $t('assets.modals.max') }}
              </button>
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
                inputmode="decimal"
                type="number"
                min="0"
                pattern="^[0-9]*(\.)?[0-9]*$"
                placeholder="0.0"
                class="input--no-spin"
                @input="inputHandler"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="box__row-button">
        <astar-action-btn @click="transfer">{{ $t('confirm') }}</astar-action-btn>
      </div>
    </div>
  </astar-simple-modal>
</template>
<script lang="ts">
import { $api, $web3 } from 'src/boot/api';
import { useAccount, useChainMetadata, useTransfer, useWalletIcon } from 'src/hooks';
import { getShortenAddress } from 'src/hooks/helper/addressUtils';
import { isValidAddressPolkadotAddress } from 'src/hooks/helper/plasmUtils';
import { useStore } from 'src/store';
import { computed, defineComponent, ref, watchEffect } from 'vue';
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
    accountData: {
      type: Object,
      required: false,
      default: null,
    },
  },
  setup(props) {
    const transferAmt = ref<string | null>(null);
    const toAddressBalance = ref<number>(0);
    const fromAddressBalance = ref<number>(0);
    const toAddress = ref<string>('');
    const { iconWallet } = useWalletIcon();
    const store = useStore();
    const { currentAccount, currentAccountName } = useAccount();
    const tokenSymbol = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      return chainInfo ? chainInfo.tokenSymbol : '';
    });
    const isH160 = computed(() => store.getters['general/isH160Formatted']);

    const inputHandler = (event: any): void => {
      transferAmt.value = event.target.value;
    };

    const closeModal = () => {
      props.handleModalTransfer(false);
    };

    const transfer = () => {
      if (Number(transferAmt.value) === 0) {
        store.dispatch('general/showAlertMsg', {
          msg: 'The amount of token to be transmitted must not be zero',
          alertType: 'error',
        });
        return;
      }
      callTransfer(Number(transferAmt.value), currentAccount.value, toAddress.value);
    };

    const { defaultUnitToken, decimal } = useChainMetadata();
    const { callTransfer } = useTransfer(defaultUnitToken, decimal, closeModal);

    const getBalance = async (address: string): Promise<number> => {
      const web3Ref = $web3.value;
      const apiRef = $api.value;
      if (!apiRef || !address || !web3Ref) return 0;
      if (isValidAddressPolkadotAddress(address)) {
        const { data } = await apiRef.query.system.account(address);
        return Number(web3Ref.utils.fromWei(data.free.toString()));
      }
      if (web3Ref.utils.isAddress(address)) {
        const balance = await web3Ref.eth.getBalance(address);
        return Number(web3Ref.utils.fromWei(balance));
      }
      return 0;
    };

    watchEffect(async () => {
      const address = toAddress.value;
      if (address) {
        toAddressBalance.value = await getBalance(address);
      }
    });

    watchEffect(async () => {
      const web3Ref = $web3.value;
      const address = currentAccount.value;
      if (!address || !web3Ref) return;
      if (isH160.value) {
        fromAddressBalance.value = await getBalance(address);
      } else {
        const balance = props.accountData
          ? web3Ref.utils.fromWei(props.accountData.getUsableTransactionBalance().toString())
          : 0;
        fromAddressBalance.value = Number(balance);
      }
    });

    return {
      iconWallet,
      currentAccount,
      currentAccountName,
      tokenSymbol,
      getShortenAddress,
      inputHandler,
      toAddress,
      transfer,
      toAddressBalance,
      fromAddressBalance,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/modal-transfer.scss';
</style>
