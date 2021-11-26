<template>
  <Modal title="Register a new dApp">
    <template #content>
      <RegisterDappGeneral
        v-if="data"
        :value="data"
        @data-changed="(newData) => handleDataChange(newData)"
      />
    </template>
    <template #buttons>
      <Button @click="registerDapp">{{ $t('store.modals.register') }}</Button>
    </template>
  </Modal>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, watch } from 'vue';
import Modal from 'components/common/Modal.vue';
import RegisterDappGeneral from 'components/store/modals/RegisterDappGeneral.vue';
import Button from 'components/common/Button.vue';
import { useStore } from 'src/store';
import { useApi } from 'src/hooks';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { NewDappItem, LooseObject } from 'src/store/dapps-store/state';
import { RegisterParameters } from 'src/store/dapps-store/actions';

export default defineComponent({
  components: {
    Modal,
    Button,
    RegisterDappGeneral,
  },
  // emits: ['update:is-open'],
  setup(_, { emit }) {
    const store = useStore();
    const { api } = useApi();
    const data = reactive<NewDappItem>({} as NewDappItem);

    const registerDapp = async () => {
      // if (!validateAll()) {
      //   return;
      // }

      const senderAddress = store.getters['general/selectedAccountAddress'];
      const result = await store.dispatch('dapps/registerDapp', {
        dapp: data,
        api: api?.value,
        senderAddress,
      } as RegisterParameters);

      if (result) {
        emit('update:is-open', false);
      }
    };

    const handleDataChange = (newData: NewDappItem): void => {
      console.log('new dapp', newData);
      data.ref = newData;
    };

    return {
      data,
      registerDapp,
      handleDataChange,
    };
  },
});
</script>
