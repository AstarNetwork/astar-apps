<template>
  <div class="wrapper--multisig">
    <button
      type="button"
      :class="width >= screenSize.sm ? 'btn--multisig' : 'm-btn--multisig'"
      @click="setShowModal(true)"
    >
      <astar-icon-base width="22" viewBox="0 0 64 64" class="icon--account">
        <astar-icon-account-sample />
      </astar-icon-base>
      <template v-if="width >= screenSize.sm">
        {{ $t('multisig') }}
      </template>
    </button>
    <modal-multisig-configure v-if="showModal" :set-is-open="setShowModal" :show="showModal" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useBreakpoints } from 'src/hooks';
import ModalMultisigConfigure from 'src/components/common/ModalMultisigConfigure.vue';
export default defineComponent({
  components: { ModalMultisigConfigure },
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
.wrapper--multisig {
  margin-right: 8px;
  @media (min-width: $lg) {
    margin-right: 16px;
  }
}
.btn--multisig {
  display: flex;
  height: 32px;
  flex-direction: row;
  align-items: center;
  padding: 8px 16px 8px 16px;
  background: transparent;
  border-radius: 16px;
  transition: all 0.3s ease 0s;
  color: #fff;
  border: 1px solid $gray-4;
  @media (min-width: $lg) {
    color: $navy-1;
    border: 1px solid $navy-3;
  }
}
.btn--multisig:hover {
  background: $astar-blue;
  border: 1px solid transparent;
  .icon--help {
    color: $gray-1;
  }
  @media (min-width: $lg) {
    background: #fff;
    border: 1px solid $gray-4;
    .icon--help {
      color: $navy-1;
    }
  }
}
.m-btn--multisig {
  padding-left: 10px;
  width: 32px;
  height: 32px;
  border: 1px solid $navy-3;
  border-radius: 16px;
  margin-left: 16px;
  transition: all 0.3s ease 0s;
  background: transparent;
  color: $gray-3;
  border: 1px solid $gray-4;
  @media (min-width: $lg) {
    border: 1px solid $navy-3;
  }
}
.m-btn--multisig:hover {
  background: $astar-blue;
  border: 1px solid transparent;
  .icon--help {
    color: $gray-1;
  }
  @media (min-width: $lg) {
    background: #fff;
  }
}
.icon--account {
  margin-right: 4px;
  margin-left: -6px;
}
.body--dark {
  .btn--multisig {
    background: transparent;
    color: #fff;
    border: 1px solid $gray-4;
  }
  .btn--multisig:hover {
    background: $astar-blue;
    border: 1px solid transparent;
  }
  .m-btn--multisig {
    background: transparent;
    color: $gray-3;
    border: 1px solid $gray-4;
  }
  .m-btn--multisig:hover {
    background: $astar-blue;
    border: 1px solid transparent;
  }
}
</style>
