<template>
  <div
    class="selector-wrapper"
    :class="disableSelection && 'cursor--default'"
    @click="handleModalSelectDapp({ isOpen: true })"
  >
    <div v-if="selectedDapp?.logoUrl"><img :src="selectedDapp?.logoUrl" class="logo" /></div>
    <div class="name">
      {{ selectedDapp?.name || placeholder }}
    </div>
    <div><astar-icon-expand size="20" /></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { Dapp } from './Model';

export default defineComponent({
  props: {
    selectedDapp: {
      type: Object as PropType<Dapp> | undefined,
      required: false,
      default: undefined,
    },
    placeholder: {
      type: String,
      required: false,
      default: 'Select a dApp',
    },
    onSelectDapps: {
      type: Function as PropType<() => void>,
      required: false,
      default: undefined,
    },
    disableSelection: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup(props) {
    const handleModalSelectDapp = ({ isOpen }: { isOpen: boolean }): void => {
      if (props.disableSelection) {
        return;
      }

      if (isOpen && props.onSelectDapps) {
        props.onSelectDapps();
      }
    };

    return { handleModalSelectDapp };
  },
});
</script>

<style lang="scss" scoped>
.selector-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 24px 24px 24px 16px;
}

.cursor--default {
  cursor: default;
}

.name {
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  text-overflow: ellipsis;
  overflow: hidden;
  margin-right: auto;
}

.logo {
  width: 24px;
  height: 24px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 8px;
}
</style>
