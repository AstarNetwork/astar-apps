<template>
  <div>
    <div
      class="selector-wrapper"
      :class="selectedDappAddress && 'cursor--default'"
      @click="handleModalSelectDapp({ isOpen: true })"
    >
      <div class="name">
        {{ placeholder }}
      </div>
      <div><astar-icon-expand size="20" /></div>
    </div>
    <modal-select-dapp
      :dapps="dapps"
      :is-modal-select-dapp="isModalSelectDapp"
      :handle-modal-select-dapp="handleModalSelectDapp"
      :dapps-selected="handleDappsSelected"
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
    selectedDappAddress: {
      type: String,
      required: false,
      default: undefined,
    },
    onDappsSelected: {
      type: Function as PropType<(dapp: Dapp[]) => void>,
      required: false,
      default: undefined,
    },
  },
  setup(props) {
    const selectedDapps = ref<Dapp[] | undefined>(
      props.dapps.filter((dapp) => dapp.address === props.selectedDappAddress)
    );
    const isModalSelectDapp = ref<boolean>(false);

    const handleDappsSelected = (dapps: Dapp[]): void => {
      selectedDapps.value = dapps;

      if (props.onDappsSelected) {
        props.onDappsSelected(dapps);
      }
    };

    const handleModalSelectDapp = ({ isOpen }: { isOpen: boolean }): void => {
      if (props.selectedDappAddress) {
        return;
      }

      isModalSelectDapp.value = isOpen;
    };

    return { selectedDapps, isModalSelectDapp, handleDappsSelected, handleModalSelectDapp };
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

.cursor--default {
  cursor: default;
}

.name {
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}
</style>
