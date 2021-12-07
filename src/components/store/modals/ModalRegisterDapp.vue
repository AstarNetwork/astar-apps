<template>
  <Modal title="Register a new dApp">
    <template #content>
      <q-form ref="registerForm">
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
        </q-stepper>
      </q-form>
    </template>
    <template #buttons>
      <q-stepper-navigation>
        <Button :primary="false" @click="step > 1 ? $refs.stepper.previous() : close()">
          {{ step &gt; 1 ? $t('store.modals.previous') : $t('close') }}
        </Button>
        <Button @click="registerDapp(step)">
          {{ step &lt; stepsCount ? $t('store.modals.next') : $t('store.modals.register') }}
        </Button>
      </q-stepper-navigation>
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
    const stepsCount = 4;
    const registerForm = ref();
    const stepper = ref();

    const registerDapp = async (step: number): Promise<void> => {
      // if (!validateAll()) {
      //   return;
      // }
      console.log('form', stepper.value);

      registerForm?.value?.validate().then(async (success: boolean) => {
        if (success) {
          if (step === stepsCount) {
            const senderAddress = store.getters['general/selectedAccountAddress'];
            const result = await store.dispatch('dapps/registerDappTest', {
              dapp: data,
              api: api?.value,
              senderAddress,
            } as RegisterParameters);

            if (result) {
              emit('update:is-open', false);
            }
          } else {
            stepper.value.next();
          }
        }
      });
    };

    const handleDataChange = (newData: NewDappItem): void => {
      console.log('new dapp', newData);
      data.ref = newData;
    };

    const close = () => {
      emit('update:is-open', false);
    };

    return {
      data,
      registerDapp,
      handleDataChange,
      step,
      stepsCount,
      close,
      registerForm,
      stepper,
    };
  },
});
</script>
