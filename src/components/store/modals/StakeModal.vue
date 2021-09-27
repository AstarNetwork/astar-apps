<template>
  <Modal :title="title">
     <template v-slot:content>
       <Avatar :url="dapp.iconUrl" class="tw-w-36 tw-h-36 tw-mb-4 tw-mx-auto"/>
       <div class="tw-mb-4">
        <label
          class="tw-block tw-text-sm tw-font-medium tw-text-gray-500 dark:tw-text-darkGray-400 tw-mb-2"
        >
          Address
        </label>
        <ModalSelectAccount
          :allAccounts="allAccounts"
          :allAccountNames="allAccountNames"
          v-model:selAddress="data.address"
        />
        
      </div>
      <InputAmount
        title="Amount"
        :noMax="true"
        v-model:amount="data.amount"
        v-model:selectedUnit="data.unit"
      />
      <div class="tw-mt-1 tw-ml-1">
        Available <FormatBalance class="tw-inline tw-font-semibold"/>
      </div>
     </template>
     <template v-slot:buttons>
      <Button @click="action(data.address, data.amount)">
        {{ actionName }}
      </Button>
    </template>
  </Modal>
</template>

<script lang="ts">
import { defineComponent, computed, ref, toRefs } from 'vue'
import { useStore } from 'src/store';
import { useChainMetadata } from 'src/hooks';
import Modal from 'components/common/Modal.vue';
import ModalSelectAccount from 'components/balance/modals/ModalSelectAccount.vue';
import InputAmount from 'src/components/common/InputAmount.vue';
import Button from 'src/components/common/Button.vue';
import Avatar from 'src/components/common/Avatar.vue';
import FormatBalance from 'src/components/balance/FormatBalance.vue'

export default defineComponent({
  components: {
    Modal,
    ModalSelectAccount,
    InputAmount,
    Button,
    Avatar,
    FormatBalance
  },
  props: {
    dapp: {
      type: Object,
      required: true
    },
    title: {
      type: String,
    },
    action: {
      type: Function,
      required: true
    },
    actionName: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const store = useStore();
    const { defaultUnitToken } = useChainMetadata();
    
    const data = ref<StakeModel>({
      address: '',
      amount: 0,
      unit: defaultUnitToken.value
    } as StakeModel);
    const allAccounts = computed(() => store.getters['general/allAccounts']);
    const allAccountNames = computed(() => store.getters['general/allAccountNames']);

    return {
      data,
      allAccounts,
      allAccountNames,
      ...toRefs(props),
    }
  },
})

interface StakeModel {
  address: string;
  amount: number;
  unit: string
}
</script>
