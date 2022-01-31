<template>
  <Modal title="Register a new dApp" @click="closeModal">
    <template #content>
      <q-form ref="registerForm">
        <q-stepper ref="stepper" v-model="step" :header-nav="false" animated>
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
          <q-step :name="3" title="Media" icon="image" :done="step > 3">
            <RegisterDappMedia
              v-if="data"
              :value="data"
              @data-changed="(newData) => handleDataChange(newData)"
            />
          </q-step>
          <q-step :name="4" title="Support" icon="info">
            <RegisterDappSupport
              v-if="data"
              :value="data"
              @data-changed="(newData) => handleDataChange(newData)"
            />
          </q-step>
        </q-stepper>
        <div class="tw-text-center">
          <q-stepper-navigation>
            <Button :primary="false" @click="step > 1 ? $refs.stepper.previous() : close()">
              {{ step &gt; 1 ? $t('dappStaking.modals.previous') : $t('close') }}
            </Button>
            <Button @click="registerDapp(step)">
              {{ step &lt; stepsCount ? $t('dappStaking.modals.next') : $t('dappStaking.modals.register') }}
            </Button>
          </q-stepper-navigation>
        </div>
      </q-form>
    </template>
  </Modal>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed } from 'vue';
import Modal from 'components/common/Modal.vue';
import RegisterDappGeneral from 'components/dapp-staking/modals/RegisterDappGeneral.vue';
import RegisterDappDescription from 'components/dapp-staking/modals/RegisterDappDescription.vue';
import RegisterDappMedia from 'components/dapp-staking/modals/RegisterDappMedia.vue';
import RegisterDappSupport from 'components/dapp-staking/modals/RegisterDappSupport.vue';
import Button from 'components/common/Button.vue';
import { useStore } from 'src/store';
import { $api } from 'boot/api';
import { NewDappItem } from 'src/store/dapp-staking/state';
import { RegisterParameters } from 'src/store/dapp-staking/actions';

export default defineComponent({
  components: {
    Modal,
    Button,
    RegisterDappGeneral,
    RegisterDappDescription,
    RegisterDappMedia,
    RegisterDappSupport,
  },
  setup(_, { emit }) {
    const store = useStore();
    // const { api } = useApi();
    const data = reactive<NewDappItem>({ tags: [] } as unknown as NewDappItem);
    const step = ref<number>(1);
    const stepsCount = 4;
    const registerForm = ref();
    const stepper = ref();
    const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);

    const registerDapp = async (step: number): Promise<void> => {
      registerForm?.value?.validate().then(async (success: boolean) => {
        if (success) {
          if (step === stepsCount) {
            const senderAddress = store.getters['general/selectedAddress'];
            const result = await store.dispatch('dapps/registerDapp', {
              dapp: data,
              api: $api?.value,
              senderAddress,
              substrateAccounts: substrateAccounts.value,
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
