<template>
  <Modal title="Register a new dApp">
    <template #content>
      <q-stepper ref="stepper" v-model="step" header-nav animated>
        <q-step :name="1" title="General" icon="settings" :done="step > 1">
          <RegisterDappGeneral
            v-if="data"
            :value="data"
            @data-changed="(newData) => handleDataChange(newData)"
          />
        </q-step>
        <q-step :name="2" title="Description" icon="notes" :done="step > 2">
          <RegisterDappDescription
            v-if="data"
            :value="data"
            @data-changed="(newData) => handleDataChange(newData)"
          />
        </q-step>
        <q-step :name="3" title="Media" icon="image">
          <RegisterDappMedia
            v-if="data"
            :value="data"
            @data-changed="(newData) => handleDataChange(newData)"
          />
        </q-step>
        <q-step :name="4" title="Support info" icon="info">
          <RegisterDappSupport
            v-if="data"
            :value="data"
            @data-changed="(newData) => handleDataChange(newData)"
          />
        </q-step>

        <template #navigation>
          <q-stepper-navigation>
            <q-btn
              color="primary"
              flat
              :label="step === 4 ? 'Finish' : 'Continue'"
              class="q-ml-sm"
              @click="$refs.stepper.next()"
            />
            <q-btn
              v-if="step > 1"
              flat
              color="primary"
              label="Back"
              class="q-ml-sm"
              @click="$refs.stepper.previous()"
            />
          </q-stepper-navigation>
        </template>
      </q-stepper>
    </template>
    <template #buttons>
      <Button @click="registerDapp">{{ $t('store.modals.register') }}</Button>
    </template>
  </Modal>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue';
import Modal from 'components/common/Modal.vue';
import RegisterDappGeneral from 'components/store/modals/RegisterDappGeneral.vue';
import RegisterDappDescription from 'components/store/modals/RegisterDappDescription.vue';
import RegisterDappMedia from 'components/store/modals/RegisterDappMedia.vue';
import RegisterDappSupport from 'components/store/modals/RegisterDappSupport.vue';
import Button from 'components/common/Button.vue';
import { useStore } from 'src/store';
import { useApi } from 'src/hooks';
import { NewDappItem } from 'src/store/dapps-store/state';
import { RegisterParameters } from 'src/store/dapps-store/actions';

export default defineComponent({
  components: {
    Modal,
    Button,
    RegisterDappGeneral,
    RegisterDappDescription,
    RegisterDappMedia,
    RegisterDappSupport,
  },
  // emits: ['update:is-open'],
  setup(_, { emit }) {
    const store = useStore();
    const { api } = useApi();
    const data = reactive<NewDappItem>({ tags: [] } as unknown as NewDappItem);
    const step = ref<number>(1);

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
      step,
    };
  },
});
</script>
