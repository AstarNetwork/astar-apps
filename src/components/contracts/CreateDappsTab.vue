<template>
  <div>
    <div class="tw-mt-3 tw-mb-12">
      <button type="button" class="create-dapp-button" @click="modalCreateDapps = true">
        <icon-base
          class="tw-w-5 tw-h-5 tw-text-white tw--ml-1"
          stroke="currentColor"
          icon-name="plus"
        >
          <icon-plus />
        </icon-base>
        {{ $t('contracts.createYourDapp') }}
      </button>
      <button type="button" class="icon-plus-button" @click="modalCodeHash = true">
        <icon-base class="plus" icon-name="plus" viewBox="0 0 24 24" stroke="currentColor">
          <icon-plus />
        </icon-base>
        {{ $t('contracts.addExistingCodeHash') }}
      </button>
    </div>

    <ContractsTable />

    <CodehashTable />

    <ModalCreateDapps
      v-if="modalCreateDapps"
      v-model:isOpen="modalCreateDapps"
      :all-accounts="allAccounts"
      :all-account-names="allAccountNames"
      :address="currentAccount"
    />
    <ModalCodeHash v-if="modalCodeHash" v-model:isOpen="modalCodeHash" :address="currentAccount" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from 'vue';
import { useAccount } from 'src/hooks';
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
    useMeta({ title: 'Deploy Contracts' });

    const stateModal = reactive<Modal>({
      modalCreateDapps: false,
      modalCodeHash: false,
    });

    const { allAccounts, allAccountNames, currentAccount } = useAccount();

    return {
      allAccounts,
      allAccountNames,
      currentAccount,
      ...toRefs(stateModal),
    };
  },
});
</script>

<style scoped>
.icon-plus-button {
  @apply tw-inline-flex tw-items-center tw-ml-3 tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-rounded-full tw-shadow-sm tw-text-blue-500 dark:tw-text-blue-400 tw-border tw-border-blue-500 dark:tw-border-blue-400 tw-mb-1 tw-group;
}
.icon-plus-button:hover {
  @apply tw-bg-blue-100 dark:tw-bg-darkGray-800 dark:tw-border-blue-300 dark:tw-text-blue-300;
}
.icon-plus-button:focus {
  @apply tw-outline-none tw-ring tw-ring-blue-100 dark:tw-ring-blue-400;
}

.create-dapp-button {
  @apply tw-inline-flex tw-items-center tw-px-4 tw-py-2 tw-border tw-border-transparent tw-text-sm tw-font-medium tw-rounded-full tw-shadow-sm tw-text-white tw-bg-blue-500 hover:tw-bg-blue-400 tw-mb-1 tw-group;
}
.create-dapp-button:focus {
  @apply tw-outline-none tw-ring tw-ring-blue-100 dark:tw-ring-blue-400;
}

.plus {
  @apply tw-w-5 tw-h-5 tw-text-blue-500 dark:tw-text-blue-400 tw--ml-1;
}
.plus:group-hover {
  @apply dark:tw-text-blue-300;
}
</style>
