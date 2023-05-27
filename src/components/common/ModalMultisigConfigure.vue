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
        <div class="row--address">
          <span class="text--md">Threshold</span>
          <input
            :value="threshold"
            inputmode="numeric"
            type="number"
            min="0"
            pattern="^[0-9]*(\.)?[0-9]*$"
            placeholder="Threshold"
            class="input--address"
            @change="setThreshold"
          />
        </div>
      </div>
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
import { createKeyMulti, encodeAddress, sortAddresses } from '@polkadot/util-crypto';
import ModalWrapper from 'src/components/common/ModalWrapper.vue';
import { useAccount, useBreakpoints } from 'src/hooks';
import { socialUrl } from 'src/links';
import { useStore } from 'src/store';
import { computed, defineComponent, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

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
    const { width, screenSize } = useBreakpoints();
    const { currentAccount } = useAccount();

    const account2 = ref<string>('');
    const account3 = ref<string>('');
    const account4 = ref<string>('');
    const account5 = ref<string>('');
    const threshold = ref<number>(2);
    const errorMsg = ref<string>('');
    const generatedMultisig = ref<string>('');
    // const accountsObj = ref({
    //   account1: currentAccount.value,
    //   account2: '',
    //   account3: '',
    //   account4: '',
    //   account5: '',
    // });
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

    const setMultisigAccount = () => {
      const accounts = Object.values(accountsObj.value).filter((account) => account !== '');
      if (accounts.length >= threshold.value) {
        const multiAddress = createKeyMulti(accounts, threshold.value);
        const formattedMultiAddress = encodeAddress(multiAddress, ASTAR_SS58_FORMAT);

        if (formattedMultiAddress === multisigAccount.value) {
          generatedMultisig.value = formattedMultiAddress;
          const otherSignatories = accounts.filter((it) => it !== accounts[0]);
          const otherSignatoriesFormatted = sortAddresses(otherSignatories, ASTAR_SS58_FORMAT);
          console.log('otherSignatoriesFormatted', otherSignatoriesFormatted);
        } else {
          errorMsg.value = "Generated multisig account isn't tally with inputted in the URL";
        }
      }
    };

    watchEffect(setMultisigAccount);

    return {
      width,
      screenSize,
      socialUrl,
      account2,
      account3,
      account4,
      account5,
      threshold,
      setAccount2,
      setAccount3,
      setAccount4,
      setAccount5,
      setThreshold,
      close,
      truncate,
      closeModal,
      isClosingModal,
      currentAccount,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/common/styles/modal-multisig-configure.scss';
</style>
