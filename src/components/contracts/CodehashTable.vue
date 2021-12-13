<template>
  <div>
    <h2
      v-show="allCode.length > 0"
      class="tw-text-blue-900 dark:tw-text-white tw-text-lg tw-font-bold tw-mb-4 tw-leading-tight"
    >
      {{ $t('contracts.codeHashes') }}
    </h2>

    <div class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-3 xl:tw-grid-cols-4 tw-gap-4">
      <CodeItem
        v-for="(code, index) in allCode"
        :key="index"
        :code="code"
        @confirmRemoval="onConfirmRemoval"
      />
    </div>
    <ModalConfirmRemoval
      v-if="modalConfirmRemoval"
      v-model:isOpen="modalConfirmRemoval"
      ctype="codehash"
      @forget="onForget"
    />
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs, computed, ref } from 'vue';
import { useStore } from 'src/store';
import { useApi } from 'src/hooks';
import CodeItem from './CodeItem.vue';
import ModalConfirmRemoval from './modals/ModalConfirmRemoval.vue';

interface Modal {
  modalConfirmRemoval: boolean;
}

export default defineComponent({
  components: {
    CodeItem,
    ModalConfirmRemoval,
  },
  setup() {
    const { api } = useApi();

    const stateModal = reactive<Modal>({
      modalConfirmRemoval: false,
    });

    const store = useStore();
    const allCode = computed(() => store.getters['contracts/getAllCode']);

    const codeHashRef = ref('');

    const loadAll = () => {
      store.dispatch('contracts/loadAllContracts', {
        api: api?.value,
      });
    };

    const onConfirmRemoval = (codeHash: string) => {
      stateModal.modalConfirmRemoval = true;

      codeHashRef.value = codeHash;
    };

    const onForget = () => {
      try {
        const _codeHash = codeHashRef.value;
        store.dispatch('contracts/forgetCode', {
          codeHash: _codeHash,
        });

        stateModal.modalConfirmRemoval = false;
      } catch (error) {
        console.error(error);
      }
    };

    loadAll();

    return {
      allCode,
      onConfirmRemoval,
      onForget,
      ...toRefs(stateModal),
    };
  },
});
</script>
