<template>
  <div class="container--nomination-transfer">
    <div class="button-account">
      <div class="box--input">
        <div>
          <input
            v-model="valueAddressOrWallet"
            class="input--transfer-from"
            type="text"
            spellcheck="false"
            :readonly="isReadOnly"
            @focus="openOption = !isEthWallet"
            @blur="closeOption"
            @change="changeAddress"
          />
        </div>
      </div>

      <div class="box--arrow">
        <icon-base class="icon--arrow" icon-name="selector" viewBox="0 0 20 20" aria-hidden="true">
          <icon-solid-selector />
        </icon-base>
      </div>
    </div>

    <div v-if="openOption" class="container--option">
      <ul class="box--option">
        <div v-if="!isEthWallet">
          <ModalSelectAccountOption
            v-for="(account, index) in substrateAccounts"
            :key="index"
            v-model:selOption="selAccountIdx"
            :address="account.address"
            :address-name="account.name"
            :checked="selAccountIdx === account.address"
          />
        </div>
      </ul>
    </div>
  </div>
</template>
<script lang="ts">
import IconBase from 'components/icons/IconBase.vue';
import IconSolidSelector from 'components/icons/IconSolidSelector.vue';
import ModalSelectAccountOption from 'src/components/common/ModalSelectAccountOption.vue';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { useAccount } from 'src/hooks';
import { getSelectedAccount } from 'src/hooks/helper/wallet';
import { useStore } from 'src/store';
import { SubstrateAccount } from 'src/store/general/state';
import { computed, defineComponent, ref, watch, watchEffect } from 'vue';

enum Role {
  FromAddress = 'FromAddress',
  ToAddress = 'ToAddress',
}

export default defineComponent({
  components: {
    ModalSelectAccountOption,
    IconBase,
    IconSolidSelector,
  },
  props: {
    dapps: {
      type: Array,
      required: true,
    },
    role: {
      type: String,
      required: false,
      default: '',
    },
    toAddress: {
      type: String,
      required: false,
      default: '',
    },
    balance: {
      type: Object,
      required: true,
    },
  },
  emits: ['update:sel-address', 'sel-changed'],
  setup(props, { emit }) {
    const isReadOnly = props.role === Role.FromAddress;
    const openOption = ref<boolean>(false);
    const store = useStore();
    const { currentAccountName, currentAccount } = useAccount();
    const currentAddress = computed(() => store.getters['general/selectedAddress']);
    const substrateAccounts = computed(() => {
      const accounts = store.getters['general/substrateAccounts'];
      const selectedAccount = getSelectedAccount(accounts);
      const filteredAccounts = accounts.filter(
        (it: SubstrateAccount) => selectedAccount && it.source === selectedAccount.source
      );
      return filteredAccounts;
    });

    const isH160 = computed(() => store.getters['general/isH160Formatted']);
    const isEthWallet = computed(() => store.getters['general/isEthWallet']);
    const selAccountIdx = props.role === Role.ToAddress ? ref('') : ref(currentAddress.value);
    const account = getSelectedAccount(substrateAccounts.value);

    const selAddress = ref(!isH160 ? (account?.address as string) : '');

    watch(
      [selAccountIdx, isEthWallet],
      () => {
        if (!isEthWallet.value) {
          const account = substrateAccounts.value.find(
            (it: SubstrateAccount) => it.address === selAccountIdx.value
          );
          if (!account) return;
          selAddress.value = account.address;

          if (props.role === Role.FromAddress) {
            store.commit('general/setCurrentAddress', account.address);
            localStorage.setItem(LOCAL_STORAGE.SELECTED_ADDRESS, String(account.address));
          }
        } else {
          const lookupAddress = props.role === Role.ToAddress ? '' : currentAccount.value;
          selAddress.value = lookupAddress;
        }

        emit('update:sel-address', selAddress.value);
        emit('sel-changed', selAccountIdx.value);

        openOption.value = false;
      },
      { immediate: true }
    );

    const closeOption = () => {
      setTimeout(() => {
        openOption.value = false;
      }, 400);
    };

    const valueAddressOrWallet = ref<string>('');
    watchEffect(() => {
      valueAddressOrWallet.value =
        props.role === Role.FromAddress ? String(currentAccountName.value) : selAddress.value;
    });

    const changeAddress = (e: any) => {
      emit('update:sel-address', e.currentTarget.value);
    };

    return {
      valueAddressOrWallet,
      openOption,
      closeOption,
      selAccountIdx,
      selAddress,
      isH160,
      isReadOnly,
      substrateAccounts,
      changeAddress,
      isEthWallet,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dapp-staking/styles/modal-nomination-transfer.scss';
</style>
