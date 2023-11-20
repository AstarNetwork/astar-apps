<template>
  <div>
    <div class="selector-wrapper" @click="handleModalSelectDapp({ isOpen: true })">
      <div class="name">
        {{ selectedDapp ? selectedDapp.name : placeholder }}
      </div>
      <div><astar-icon-expand size="20" /></div>
    </div>
    <modal-select-dapp
      :dapps="dapps"
      :is-modal-select-dapp="isModalSelectDapp"
      :handle-modal-select-dapp="handleModalSelectDapp"
      :dapp-selected="handleDappSelected"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { Dapp } from './Model';
import ModalSelectDapp from './ModalSelectDapp.vue';

export default defineComponent({
  components: {
    ModalSelectDapp,
  },
  props: {
    dapps: {
      type: Object as PropType<Dapp[]>,
      required: true,
    },
    placeholder: {
      type: String,
      required: false,
      default: 'Select a dApp',
    },
    dappSelected: {
      type: Function as PropType<(dapp: Dapp) => void>,
      required: false,
      default: undefined,
    },
  },
  setup(props) {
    const selectedDapp = ref<Dapp | undefined>(undefined);
    const isModalSelectDapp = ref<boolean>(false);

    const handleDappSelected = (dapp: Dapp): void => {
      selectedDapp.value = dapp;

      if (props.dappSelected) {
        props.dappSelected(dapp);
      }
    };

    const handleModalSelectDapp = ({ isOpen }: { isOpen: boolean }): void => {
      isModalSelectDapp.value = isOpen;
    };

    return { selectedDapp, isModalSelectDapp, handleDappSelected, handleModalSelectDapp };
  },
});
</script>

<style lang="scss" scoped>
.selector-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.name {
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}
</style>
