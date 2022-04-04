<template>
  <astar-simple-modal :show="isOpen" title="Wallet" @close="closeModal">
    <div class="wrapper--modal-account">
      <div class="wrapper--select-network">
        <div class="row--separator--account">
          <div class="border--separator--account" />
        </div>
        <div>
          <SelectWallet :set-wallet-modal="setWalletModal" :selected-wallet="selectedWallet" />
        </div>
        <fieldset>
          <div v-if="isMathWallet" class="column--remarks">
            <li v-if="currentNetworkIdx !== endpointKey.SHIDEN">
              {{ $t('balance.modals.math.supportsNetwork') }}
            </li>
            <li v-if="!substrateAccounts.length">
              {{ $t('balance.modals.math.switchNetwork') }}
            </li>
          </div>
          <ul v-else role="radiogroup" class="list--account">
            <li v-for="(account, index) in substrateAccounts" :key="index">
              <label
                :class="[
                  'class-radio',
                  selAccount === account.address ? 'class-radio-on' : 'class-radio-off',
                ]"
              >
                <input
                  name="choose_account"
                  type="radio"
                  :checked="selAccount === account.address"
                  class="ip--account"
                  @change="selAccount = account.address"
                />
                <div class="wrapper--account-detail">
                  <div class="accountName">{{ account.name }}</div>
                  <div class="address">{{ account.address }}</div>
                  <div class="wrapper--share">
                    <div class="box--share" @click="copyAddress(account.address)">
                      <img
                        :src="
                          isDarkTheme ? 'icons/icon-copy-dark-nobg.svg' : 'icons/icon-copy-nobg.svg'
                        "
                      />
                      <div>{{ $t('copy') }}</div>
                    </div>
                    <a :href="subScan + account.address" target="_blank" rel="noopener noreferrer">
                      <div class="box--share">
                        <img
                          :src="
                            isDarkTheme
                              ? 'icons/icon-external-link-dark-nobg.svg'
                              : 'icons/icon-external-link-nobg.svg'
                          "
                        />
                        <div>{{ $t('subscan') }}</div>
                      </div>
                    </a>
                  </div>
                </div>
              </label>
            </li>
          </ul>
        </fieldset>
      </div>
      <div class="wrapper__row--button">
        <button
          :disabled="substrateAccounts.length > 0 && !selAccount"
          class="btn btn--connect"
          @click="selectAccount(selAccount)"
        >
          {{ $t('connect') }}
        </button>
      </div>
    </div>
  </astar-simple-modal>
</template>
<script lang="ts">
import SelectWallet from 'src/components/header/modals/SelectWallet.vue';
import { endpointKey, providerEndpoints } from 'src/config/chainEndpoints';
import { SupportWallet } from 'src/config/wallets';
import { castMobileSource, checkIsEthereumWallet } from 'src/hooks/helper/wallet';
import { useStore } from 'src/store';
import { SubstrateAccount } from 'src/store/general/state';
import { computed, defineComponent, PropType, ref } from 'vue';
import copy from 'copy-to-clipboard';

export default defineComponent({
  components: {
    SelectWallet,
  },
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
    selectedWallet: {
      type: String as PropType<SupportWallet>,
      required: true,
    },
    setWalletModal: {
      type: Function,
      required: true,
    },
    connectEthereumWallet: {
      type: Function,
      required: true,
    },
  },
  emits: ['update:is-open'],
  setup(props, { emit }) {
    const closeModal = (): void => {
      emit('update:is-open', false);
    };

    const isDarkTheme = computed(() => store.getters['general/theme'] === 'DARK');
    const store = useStore();

    const substrateAccounts = computed(() => {
      const accounts = store.getters['general/substrateAccounts'];
      const filteredAccounts = accounts.filter((it: SubstrateAccount) => {
        const lookupWallet = castMobileSource(props.selectedWallet);
        return it.source === lookupWallet;
      });
      return filteredAccounts;
    });
    const currentNetworkIdx = computed(() => store.getters['general/networkIdx']);
    const isMathWallet = computed(
      () => !substrateAccounts.value.length && props.selectedWallet === SupportWallet.Math
    );

    const selectAccount = (substrateAccount: string) => {
      if (checkIsEthereumWallet(props.selectedWallet)) {
        props.connectEthereumWallet(props.selectedWallet);
      }
      substrateAccount && store.commit('general/setCurrentAddress', substrateAccount);
      emit('update:is-open', false);
    };

    const selAccount = ref<string>('');
    const currentNetworkStatus = computed(() => store.getters['general/networkStatus']);
    const subScan = computed(
      () => `${providerEndpoints[currentNetworkIdx.value].subscan}/account/`
    );

    const copyAddress = (address: string) => {
      copy(address);
      store.dispatch('general/showAlertMsg', {
        msg: 'Copy address success!',
        alertType: 'success',
      });
    };

    return {
      selAccount,
      closeModal,
      selectAccount,
      currentNetworkStatus,
      substrateAccounts,
      SupportWallet,
      currentNetworkIdx,
      isDarkTheme,
      subScan,
      copyAddress,
      endpointKey,
      isMathWallet,
    };
  },
  methods: {
    isConnected(networkStatus: string) {
      return networkStatus === 'connected';
    },
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';
@import 'src/css/utils.scss';

.list--account {
  max-height: 480px;
  overflow-y: auto;
}

.wrapper--modal-account {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: 24px;
  padding-bottom: 20px;
}

.class-radio {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 6px;
  width: rem(314);
  font-weight: 700;
  font-size: 16px;
  line-height: 18px;
  color: $gray-5;
  margin: 0 auto;
  margin-top: 16px;
  padding: 16px;
  cursor: pointer;
}
.class-radio-off {
  background: #fff;
  border: 1px solid transparent;
}
.class-radio-off:hover {
  border: 1px solid $astar-blue-dark;
}
.class-radio-on {
  border: 2px solid $astar-blue-dark;
}

.ip--account {
  width: 1rem;
  height: 1rem;
  background: #fff;
  appearance: none;
  margin-right: 0.75rem;
  border-radius: 9999px;

  &:checked {
    background: $astar-blue;
    border-width: 4px;
  }
}

.wrapper--account-detail {
  width: 225px;
  text-align: left;
  .accountName {
    color: $gray-5;
    font-weight: 700;
    font-size: 16px;
    line-height: 18px;
  }
  .address {
    color: $gray-4;
    font-weight: 510;
    font-size: 12px;
    line-height: 20px;
    word-wrap: break-word;
    margin-top: 9px;
  }
}
.wrapper--share {
  display: flex;
  column-gap: 16px;
  justify-content: center;
  cursor: pointer;
  margin-top: 10px;
  .box--share {
    display: flex;
    align-items: center;
    color: $astar-blue-dark;
    font-weight: 400;
    font-size: 14px;
    line-height: 17px;
  }
}

.wrapper__row--button {
  display: flex;
  justify-content: center;
}

.btn--connect {
  width: 340px;
  background-color: $astar-blue;
  font-size: 20px;
  font-weight: 600;
  border-radius: 30px;
  height: 52px;
  margin-top: 24px;
  &:hover {
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)),
      linear-gradient(0deg, $astar-blue, $astar-blue);
  }
}

.column--remarks {
  display: flex;
  flex-direction: column;
  text-align: left;
  row-gap: 8px;
  padding-top: 24px;
  padding-left: 28px;
}

.body--dark {
  .class-radio {
    color: #fff;
  }
  .class-radio-off {
    background: $gray-6;
  }

  .class-radio-on {
    background: $gray-5-selected-dark;
  }

  .wrapper--account-detail {
    .accountName {
      color: $gray-1;
    }
    .address {
      color: $gray-3;
    }
  }
}
</style>
