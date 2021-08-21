<template>
  <div class="tw-mt-3 tw-mb-12">
    <button
      type="button"
      @click="modalCreateDapps = true"
      class="tw-inline-flex tw-items-center tw-px-4 tw-py-2 tw-border tw-border-transparent tw-text-sm tw-font-medium tw-rounded-full tw-shadow-sm tw-text-white tw-bg-blue-500 hover:tw-bg-blue-400 focus:tw-outline-none focus:tw-ring focus:tw-ring-blue-100 dark:focus:tw-ring-blue-400 tw-mb-1 tw-group"
    >
      <icon-base
        class="tw-w-5 tw-h-5 tw-text-white tw--ml-1"
        stroke="currentColor"
        icon-name="plus"
      >
        <icon-plus />
      </icon-base>
      Create your dApp
    </button>
    <button
      type="button"
      @click="modalCodeHash = true"
      class="tw-inline-flex tw-items-center tw-ml-3 tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-rounded-full tw-shadow-sm tw-text-blue-500 dark:tw-text-blue-400 tw-border tw-border-blue-500 dark:tw-border-blue-400 hover:tw-bg-blue-100 dark:hover:tw-bg-darkGray-800 dark:hover:tw-border-blue-300 dark:hover:tw-text-blue-300 focus:tw-outline-none focus:tw-ring focus:tw-ring-blue-100 dark:focus:tw-ring-blue-400 tw-mb-1 tw-group"
    >
      <icon-base
        class="tw-w-5 tw-h-5 tw-text-blue-500 dark:tw-text-blue-400 tw--ml-1 dark:group-hover:tw-text-blue-300"
        icon-name="plus"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <icon-plus />
      </icon-base>
      Add an existing code hash
    </button>
  </div>

  <CodehashTable />

  <ContractsTable />

  <ModalCreateDapps
    v-if="modalCreateDapps"
    v-model:isOpen="modalCreateDapps"
    :all-accounts="allAccounts"
    :all-account-names="allAccountNames"
    :address="currentAccount"
  />
  <ModalCodeHash
    v-if="modalCodeHash"
    v-model:isOpen="modalCodeHash"
    :address="currentAccount"
  />
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, computed, watch, ref } from 'vue';
import { useAccount } from 'src/hooks';
import { useStore } from 'src/store';
import { useMeta } from 'quasar';
import IconPlus from 'components/icons/IconPlus.vue';
import IconBase from 'components/icons/IconBase.vue';
import CodehashTable from './CodehashTable.vue';
import ContractsTable from './ContractsTable.vue';
import ModalCreateDapps from './modals/ModalCreateDapps.vue';
import ModalCodeHash from './modals/ModalCodeHash.vue';

interface Modal {
  modalCreateDapps: boolean;
  modalCodeHash: boolean;
}

export default defineComponent({
  components: {
    IconPlus,
    IconBase,
    ModalCreateDapps,
    ModalCodeHash,
    CodehashTable,
    ContractsTable,
  },
  setup() {
    useMeta({ title: 'Dapps-Create dApps' });

    const stateModal = reactive<Modal>({
      modalCreateDapps: false,
      modalCodeHash: false,
    });

    const currentAccount = ref('');
    const currentAccountName = ref('');

    const {
      allAccounts,
      allAccountNames,
    } = useAccount(currentAccount, currentAccountName);

    const store = useStore();
    const currentAccountIdx = computed(() => store.getters['general/accountIdx']);
    
    return {
      allAccounts,
      allAccountNames,
      currentAccount,
      currentAccountIdx,
      ...toRefs(stateModal),
    };
  },
});
</script>
