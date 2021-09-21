<template>
  <div>
    <Button
      @click="showRegisterDappModal = true"
    >
      <icon-base
        class="tw-w-5 tw-h-5 tw-text-white tw--ml-1"
        stroke="currentColor"
        icon-name="plus"
      >
        <icon-plus />
      </icon-base>
      Register dApp
    </Button>
    <div class="tw-flex tw-flex-wrap tw-justify-start">
      <Dapp v-for="(dapp, index) in dapps" :key="index" :dapp="dapp" v-on:dappClick="showDetailsModal" />
    </div>
  </div>

  <ModalRegisterDapp
    v-if="showRegisterDappModal"
    v-model:isOpen="showRegisterDappModal"
  />
  <ModalDappDetails
    v-if="showDappDetailsModal"
    v-model:isOpen="showDappDetailsModal"
    :dapp="selectedDapp"
  />
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue'
import { useStore } from 'src/store';
import Dapp from 'src/components/store/Dapp.vue'
import IconPlus from 'components/icons/IconPlus.vue';
import IconBase from 'components/icons/IconBase.vue';
import ModalRegisterDapp from 'components/store/modals/ModalRegisterDapp.vue'
import ModalDappDetails from 'components/store/modals/ModalDappDetails.vue'
import Button from 'components/common/Button.vue';
import { DappItem } from 'src/store/dapps-store/state';

export default defineComponent({
  components: {
    Dapp,
    IconPlus,
    IconBase,
    ModalRegisterDapp,
    ModalDappDetails,
    Button
  },
  setup() {
    const store = useStore();
    const dapps = computed(() => store.getters['dapps/getAllDapps']);
    const showRegisterDappModal = ref<boolean>(false);
    const showDappDetailsModal = ref<boolean>(false);
    const selectedDapp = ref<DappItem>();

    store.dispatch('dapps/getDapps');

    const showDetailsModal = (dapp: DappItem): void => {
      selectedDapp.value = dapp;
      showDappDetailsModal.value = true;
    }

    return {
      dapps,
      selectedDapp,
      showRegisterDappModal,
      showDappDetailsModal,
      showDetailsModal
    }
  },
})
</script>