<template>
  <div class="button--icon-help">
    <button type="button" class="btn--help" @click="setShowModal(true)">
      <div class="icon--help">
        <astar-icon-question />
      </div>
      <q-tooltip>
        <span class="text--tooltip">{{ $t('help') }}</span>
      </q-tooltip>
    </button>
    <modal-connection-trouble v-if="showModal" :set-is-open="setShowModal" :show="showModal" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useBreakpoints } from 'src/hooks';
import ModalConnectionTrouble from 'src/components/common/ModalConnectionTrouble.vue';

export default defineComponent({
  components: { ModalConnectionTrouble },
  setup() {
    const { width, screenSize } = useBreakpoints();
    const showModal = ref<boolean>(false);
    const setShowModal = (isOpen: boolean): void => {
      showModal.value = isOpen;
    };
    return {
      width,
      screenSize,
      showModal,
      setShowModal,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';
@import 'src/css/utils.scss';

.btn--help {
  width: 32px;
  height: 32px;
  color: white;
  border: solid 1px white;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 16px;
  transition: all 0.2s ease;
  &:hover {
    border-color: $astar-blue;
    background-color: $astar-blue;
  }
  @media (min-width: $lg) {
    width: 40px;
    height: 40px;
    border-radius: 20px;
  }
}
.icon--help {
  svg {
    width: 20px;
    height: 20px;
    @media (min-width: $lg) {
      width: 24px;
      height: 24px;
    }
  }
}
</style>
