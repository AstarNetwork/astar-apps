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
          <div v-if="!substrateAccounts.length && selectedWallet === SupportWallet.Math">
            <li v-if="currentNetworkIdx !== 1">
              {{ $t('balance.modals.math.supportsNetwork') }}
            </li>
            <li v-if="!substrateAccounts.length">
              {{ $t('balance.modals.math.switchNetwork') }}
            </li>
          </div>
          <ul v-else role="radiogroup" class="list--account">
            <li v-for="(account, index) in substrateAccounts" :key="index" class="tw-mb-2">
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
                  class="
                    ip--account
                    tw-appearance-none
                    tw-border-2
                    tw-border-gray-100
                    tw-rounded-full
                    tw-h-4
                    tw-w-4
                    tw-mr-3
                    focus:tw-outline-none
                    tw-bg-white
                    checked:tw-border-4
                  "
                  @change="selAccount = account.address"
                />
                <div class="wrapper--account-detail tw-text-left">
                  <div class="accountName">{{ account.name }}</div>
                  <div class="address">{{ account.address }}</div>
                  <div class="wrapper--share">
                    <div class="box--share">
                      <img
                        :src="
                          isDarkTheme ? 'icons/icon-copy-dark-nobg.svg' : 'icons/icon-copy-nobg.svg'
                        "
                        @click="copyAddress"
                      />
                      <div>{{ $t('copy') }}</div>
                    </div>
                    <a :href="subScan" target="_blank" rel="noopener noreferrer">
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
import { providerEndpoints } from 'src/config/chainEndpoints';
import { SupportWallet } from 'src/config/wallets';
import { useAccount } from 'src/hooks';
import { castMobileSource } from 'src/hooks/helper/wallet';
import { useStore } from 'src/store';
import { SubstrateAccount } from 'src/store/general/state';
import { computed, defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';

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
      type: String,
      required: true,
    },
    setWalletModal: {
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
    const { currentAccount } = useAccount();

    const currentRoute = computed(() => {
      return useRouter().currentRoute.value;
    });
    const isBalancePath = currentRoute.value.matched[0].path === '/balance';
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
    const isSupportContract = ref(providerEndpoints[currentNetworkIdx.value].isSupportContract);

    const selectAccount = (account: string) => {
      account && store.commit('general/setCurrentAddress', account);
      emit('update:is-open', false);
    };

    const selAccount = ref<string>('');

    const currentNetworkStatus = computed(() => store.getters['general/networkStatus']);

    const subScan = computed(
      () => `${providerEndpoints[currentNetworkIdx.value].subscan}/account/${currentAccount.value}`
    );

    const copyAddress = async () => {
      await navigator.clipboard.writeText(currentAccount.value);
      store.dispatch('general/showAlertMsg', {
        msg: 'Copy address success!!',
        alertType: 'success',
      });
    };

    return {
      selAccount,
      isSupportContract,
      closeModal,
      selectAccount,
      isBalancePath,
      currentNetworkStatus,
      substrateAccounts,
      SupportWallet,
      currentNetworkIdx,
      isDarkTheme,
      subScan,
      copyAddress,
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
  background: #fff;

  &:checked {
    background: $astar-blue;
  }
}

.wrapper--account-detail {
  width: 225px;
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

.body--dark {
  .class-radio {
    color: #fff;
  }
  .class-radio-off {
    background: $gray-6;
  }

  .class-radio-on {
    background: $gray-5-selected;
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
