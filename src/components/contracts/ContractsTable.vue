<template>
  <div>
    <h2
      class="
        tw-text-blue-900
        dark:tw-text-white
        tw-text-lg tw-font-bold tw-mt-4 tw-mb-4 tw-leading-tight
      "
    >
      {{ $t('contracts.contracts') }}
    </h2>

    <div class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-3 xl:tw-grid-cols-4 tw-gap-4">
      <ContractItem
        v-for="(contract, index) in contracts"
        :key="contract.address.toString()"
        :contract="contract"
        :index="index"
        @callMethod="onCallMethod"
        @confirmRemoval="onConfirmRemoval"
      />
    </div>
    <ModalConfirmRemoval
      v-if="modalConfirmRemoval"
      v-model:isOpen="modalConfirmRemoval"
      ctype="contract"
      @forget="onForget"
    />
    <ModalCallContract
      v-if="modalCallContract"
      v-model:isOpen="modalCallContract"
      :contract="currentContract"
      :message-index="messageIndex"
    />
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs, ref, computed } from 'vue';
import ContractItem from './ContractItem.vue';
import ModalConfirmRemoval from './modals/ModalConfirmRemoval.vue';
import ModalCallContract from './modals/ModalCallContract.vue';
import { useApi, useContracts } from 'src/hooks';
import { ApiPromise } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';
import { getContractForAddress } from 'src/hooks/helper/contractUtils';
import { keyring } from '@polkadot/ui-keyring';

interface Modal {
  modalConfirmRemoval: boolean;
  modalCallContract: boolean;
}

export default defineComponent({
  components: {
    ContractItem,
    ModalConfirmRemoval,
    ModalCallContract,
  },
  setup() {
    const { api } = useApi();

    const stateModal = reactive<Modal>({
      modalConfirmRemoval: false,
      modalCallContract: false,
    });

    const { allContracts } = useContracts();

    function filterContracts(api: ApiPromise, keyringContracts: string[] = []): ContractPromise[] {
      return keyringContracts
        .map((address) => getContractForAddress(api, address.toString()))
        .filter((contract): contract is ContractPromise => !!contract);
    }

    const contracts = computed(() => {
      return filterContracts(api?.value as ApiPromise, allContracts.value);
    });

    const contractIndex = ref(0);
    const messageIndex = ref(0);
    const addrRef = ref('');

    // should check again
    const currentContract = computed(() => {
      return contracts.value[contractIndex.value];
    });

    const onCallMethod = (contractIdx: number, msgIdx: number) => {
      stateModal.modalCallContract = true;

      contractIndex.value = contractIdx;
      messageIndex.value = msgIdx;

      console.log('c', contractIdx + '/' + msgIdx);
    };

    const onConfirmRemoval = (address: string) => {
      stateModal.modalConfirmRemoval = true;

      addrRef.value = address;
    };

    const onForget = () => {
      try {
        keyring.forgetContract(addrRef.value);

        stateModal.modalConfirmRemoval = false;
      } catch (error) {
        console.error(error);
      }
    };

    return {
      contracts,
      onCallMethod,
      onConfirmRemoval,
      onForget,
      currentContract,
      messageIndex,
      ...toRefs(stateModal),
    };
  },
});
</script>
