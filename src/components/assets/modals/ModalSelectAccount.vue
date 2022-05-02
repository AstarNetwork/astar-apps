<template>
  <div class="wrapper--select-account">
    <div class="row--input">
      <div class="column--icon-account">
        <div class="column--icon">
          <div v-if="isErc20Transfer || toAddress">
            <img
              v-if="isErc20Transfer || isToEvmAddress"
              width="24"
              src="~assets/img/ethereum.png"
            />
            <astar-icon-base v-else width="24" viewBox="0 0 64 64">
              <astar-icon-account-sample />
            </astar-icon-base>
          </div>
          <div v-else class="placeholder--icon" />
        </div>
        <input
          :value="toAddress"
          class="input--address text--title"
          type="text"
          spellcheck="false"
          placeholder="Destination Address"
          @focus="openOption = !isEthWallet"
          @blur="closeOption"
          @change="changeAddress"
        />
      </div>

      <div v-if="!isEthWallet">
        <astar-icon-base
          class="icon--selector"
          icon-name="selector"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <astar-icon-solid-selector />
        </astar-icon-base>
      </div>
    </div>
    <div v-if="openOption" class="box--account-option">
      <ul class="container--accounts">
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
import { isValidEvmAddress } from 'src/config/web3';
import { getSelectedAccount } from 'src/hooks/helper/wallet';
import { useStore } from 'src/store';
import { SubstrateAccount } from 'src/store/general/state';
import { computed, defineComponent, ref, watch, watchEffect } from 'vue';
import ModalSelectAccountOption from './ModalSelectAccountOption.vue';

export default defineComponent({
  components: {
    ModalSelectAccountOption,
  },
  props: {
    toAddress: {
      type: String,
      required: false,
      default: '',
    },
    isErc20Transfer: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['update:sel-address', 'sel-changed'],
  setup(props, { emit }) {
    const openOption = ref<boolean>(false);
    const isToEvmAddress = ref<boolean>(false);
    const selAccountIdx = ref<string>('');

    const store = useStore();
    const substrateAccounts = computed(() => {
      const accounts = store.getters['general/substrateAccounts'];
      const selectedAccount = getSelectedAccount(accounts);
      const filteredAccounts = accounts.filter(
        (it: SubstrateAccount) => selectedAccount && it.source === selectedAccount.source
      );
      return filteredAccounts;
    });

    const account = getSelectedAccount(substrateAccounts.value);
    const isH160 = computed(() => store.getters['general/isH160Formatted']);
    const isEthWallet = computed(() => store.getters['general/isEthWallet']);
    const selAddress = ref(!isH160 ? (account?.address as string) : '');

    const closeOption = () => {
      setTimeout(() => {
        openOption.value = false;
      }, 400);
    };

    const changeAddress = (e: any) => {
      emit('update:sel-address', e.currentTarget.value);
    };

    watch(
      [selAccountIdx, isEthWallet],
      () => {
        if (!isEthWallet.value) {
          const account = substrateAccounts.value.find(
            (it: SubstrateAccount) => it.address === selAccountIdx.value
          );
          if (!account) return;
          selAddress.value = account.address;
        } else {
          selAddress.value = '';
        }
        emit('update:sel-address', selAddress.value);
        emit('sel-changed', selAccountIdx.value);
        openOption.value = false;
      },
      { immediate: true }
    );

    watchEffect(() => {
      isToEvmAddress.value = isValidEvmAddress(props.toAddress ? props.toAddress : '');
    });

    watchEffect(() => {
      if (!props.toAddress && isH160.value) {
        isToEvmAddress.value = true;
      }
    });

    return {
      openOption,
      closeOption,
      selAccountIdx,
      selAddress,
      isH160,
      isToEvmAddress,
      substrateAccounts,
      changeAddress,
      isEthWallet,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/modal-select-account.scss';
</style>
