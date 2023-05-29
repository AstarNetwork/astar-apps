<template>
  <modal-wrapper
    :is-modal-open="show"
    :title="$t('assets.modals.multisigConfigure.multisigConfigure')"
    :is-closing="isClosingModal"
    :close-modal="closeModal"
    class-name="highest-z-index"
  >
    <div class="wrapper--multisig-configure">
      <div class="row--description">
        <span class="text--md">
          {{ $t('assets.modals.multisigConfigure.tipsDescription') }}
        </span>
      </div>
      <div class="row--addresses">
        <div class="row--address">
          <span class="text--md">Account 1</span>
          <input
            :value="currentAccount"
            class="input--address text--title"
            type="text"
            spellcheck="false"
            :readonly="true"
          />
        </div>
        <div class="row--address">
          <span class="text--md">Account 2</span>
          <input
            :value="account2"
            class="input--address text--title"
            type="text"
            spellcheck="false"
            placeholder="Account 2"
            @change="setAccount2"
          />
        </div>
        <div class="row--address">
          <span class="text--md">Account 3</span>
          <input
            :value="account3"
            class="input--address text--title"
            type="text"
            spellcheck="false"
            placeholder="Account 3 (optional)"
            @change="setAccount3"
          />
        </div>
        <div class="row--address">
          <span class="text--md">Account 4</span>
          <input
            :value="account4"
            class="input--address text--title"
            type="text"
            spellcheck="false"
            placeholder="Account 4 (optional)"
            @change="setAccount4"
          />
        </div>
        <div class="row--address">
          <span class="text--md">Account 5</span>
          <input
            :value="account5"
            class="input--address text--title"
            type="text"
            spellcheck="false"
            placeholder="Account 5 (optional)"
            @change="setAccount5"
          />
        </div>
      </div>
      <div class="row--results">
        <div class="row--address">
          <span class="text--md">Threshold</span>
          <input
            :value="threshold"
            inputmode="numeric"
            type="number"
            min="0"
            pattern="^[0-9]*(\.)?[0-9]*$"
            placeholder="2"
            class="input--address"
            @change="setThreshold"
          />
        </div>
        <div class="row--address">
          <span class="text--md">Multisig Address</span>
          <input
            :value="generatedMultisig"
            class="input--address text--title"
            :class="errorMsg && 'input--error'"
            type="text"
            spellcheck="false"
            :readonly="true"
          />
          <span class="text--error-msg">{{ errorMsg }}</span>
        </div>
      </div>
      <astar-button
        :disabled="generatedMultisig !== multisigAccount"
        class="button--confirm"
        @click="handleConfirm"
      >
        {{ $t('confirm') }}
      </astar-button>
    </div>
  </modal-wrapper>
</template>

<script lang="ts">
import {
  ASTAR_SS58_FORMAT,
  isValidAddressPolkadotAddress,
  truncate,
  wait,
} from '@astar-network/astar-sdk-core';
import { fadeDuration } from '@astar-network/astar-ui';
import { createKeyMulti, encodeAddress } from '@polkadot/util-crypto';
import { LocalStorage } from 'quasar';
import ModalWrapper from 'src/components/common/ModalWrapper.vue';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { socialUrl } from 'src/links';
import { useStore } from 'src/store';
import { computed, defineComponent, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

type DefaultStateParam = 'threshold' | '1' | '2' | '3' | '4';

export default defineComponent({
  components: { ModalWrapper },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    setIsOpen: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const isClosingModal = ref<boolean>(false);
    const closeModal = async (): Promise<void> => {
      isClosingModal.value = true;
      await wait(fadeDuration);
      props.setIsOpen(false);
      isClosingModal.value = false;
    };

    const store = useStore();
    const { t } = useI18n();
    const currentAccount = computed(() => store.getters['general/selectedAddress']);

    const storedMultisigObjStr = LocalStorage.getItem(LOCAL_STORAGE.MULTISIG);
    const storedMultisigObj = JSON.parse(storedMultisigObjStr as string);

    const initDefaultState = (key: DefaultStateParam) => {
      if (!storedMultisigObjStr) {
        return key === 'threshold' ? 2 : '';
      }

      if (key === 'threshold') {
        return storedMultisigObj[key];
      } else {
        const isValid = storedMultisigObj.accounts.some(
          (it: string) => it === currentAccount.value
        );
        if (!isValid) return '';

        const otherSignatories = storedMultisigObj.accounts.filter(
          (it: string) => it !== currentAccount.value
        );
        const index = Number(key) - 1;
        return otherSignatories[index] ? otherSignatories[index] : '';
      }
    };

    const account2 = ref<string>(initDefaultState('1'));
    const account3 = ref<string>(initDefaultState('2'));
    const account4 = ref<string>(initDefaultState('3'));
    const account5 = ref<string>(initDefaultState('4'));
    const threshold = ref<number>(initDefaultState('threshold'));
    const errorMsg = ref<string>('');
    const generatedMultisig = ref<string>('');
    const accountsObj = computed(() => {
      return {
        account1: currentAccount.value,
        account2: isValidAddressPolkadotAddress(account2.value) ? account2.value : '',
        account3: isValidAddressPolkadotAddress(account3.value) ? account3.value : '',
        account4: isValidAddressPolkadotAddress(account4.value) ? account4.value : '',
        account5: isValidAddressPolkadotAddress(account5.value) ? account5.value : '',
      };
    });

    const setAccount2 = (e: any): void => {
      account2.value = e.currentTarget.value;
    };
    const setAccount3 = (e: any): void => {
      account3.value = e.currentTarget.value;
    };
    const setAccount4 = (e: any): void => {
      account4.value = e.currentTarget.value;
    };
    const setAccount5 = (e: any): void => {
      account5.value = e.currentTarget.value;
    };

    const setThreshold = (e: any): void => {
      threshold.value = Number(e.currentTarget.value);
    };

    const route = useRoute();
    const multisigAccount = computed<string>(() => route.query.multisig as string);

    const setMultisigAccount = (): void => {
      errorMsg.value = '';
      const accounts = Object.values(accountsObj.value).filter((account) => account !== '');
      if (accounts.length >= threshold.value) {
        const multiAddress = createKeyMulti(accounts, threshold.value);
        const formattedMultiAddress = encodeAddress(multiAddress, ASTAR_SS58_FORMAT);
        generatedMultisig.value = formattedMultiAddress;

        if (formattedMultiAddress !== multisigAccount.value) {
          errorMsg.value =
            "Generated multisig account doesn't tally with what's inputted in the URL";
        }
      } else {
        generatedMultisig.value = '';
      }
    };

    const handleConfirm = async (): Promise<void> => {
      localStorage.setItem(
        LOCAL_STORAGE.MULTISIG,
        JSON.stringify({
          threshold: threshold.value,
          accounts: Object.values(accountsObj.value).filter((account) => account !== ''),
          multisigAccount: generatedMultisig.value,
        })
      );
      await closeModal();
    };

    watchEffect(setMultisigAccount);

    return {
      socialUrl,
      account2,
      account3,
      account4,
      account5,
      threshold,
      generatedMultisig,
      multisigAccount,
      isClosingModal,
      currentAccount,
      errorMsg,
      setAccount2,
      setAccount3,
      setAccount4,
      setAccount5,
      setThreshold,
      close,
      truncate,
      closeModal,
      handleConfirm,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/common/styles/modal-multisig-configure.scss';
</style>
