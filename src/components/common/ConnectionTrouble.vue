<template>
  <div class="wrapper--connection-trouble">
    <div class="row--connection-trouble" @click="setShowModal(true)">
      <span class="text--connection-trouble">{{ $t('sidenavi.connectionTrouble') }}</span>
    </div>
    <modal-connection-trouble v-if="showModal" :set-is-open="setShowModal" :show="showModal" />
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import ModalConnectionTrouble from 'src/components/common/ModalConnectionTrouble.vue';

export default defineComponent({
  components: { ModalConnectionTrouble },
  setup() {
    const showModal = ref<boolean>(false);
    const setShowModal = (isOpen: boolean): void => {
      showModal.value = isOpen;
    };
    return { showModal, setShowModal };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.wrapper--connection-trouble {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 16px;
  margin-bottom: 16px;
  padding: 0 16px;
  @media (min-width: $lg) {
    margin-top: 0px;
    padding: 0;
  }
}
.row--connection-trouble {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid $gray-4;
  border-radius: 100px;
  padding: 8px;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease 0s;
  &:hover {
    border: 1px solid $astar-blue;
    .text--connection-trouble {
      color: $astar-blue;
    }
  }
}

.text--connection-trouble {
  font-weight: 400;
  font-size: 14px;
  color: $gray-4;
  transition: all 0.3s ease 0s;
}
</style>
