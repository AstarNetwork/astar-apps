<template>
  <div class="wrapper--trouble-help">
    <button
      type="button"
      :class="width >= screenSize.sm ? 'btn--help' : 'm-btn--help'"
      @click="setShowModal(true)"
    >
      <div class="icon--help">
        <astar-icon-help size="20" />
      </div>
      <template v-if="width >= screenSize.sm">
        {{ $t('help') }}
      </template>
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

.wrapper--trouble-help {
  margin-right: 16px;
  @media (max-width: $lg) {
    display: none;
  }
}

.btn--help {
  display: flex;
  height: 32px;
  flex-direction: row;
  align-items: center;
  padding: 8px 16px 8px 16px;
  background: transparent;
  border-radius: 16px;
  margin-left: 8px;
  transition: all 0.3s ease 0s;
  color: #fff;
  border: 1px solid $gray-4;

  @media (min-width: $lg) {
    color: $navy-1;
    border: 1px solid $navy-3;
  }
}
.btn--help:hover {
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

.m-btn--help {
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

.m-btn--help:hover {
  background: $astar-blue;
  border: 1px solid transparent;
  .icon--help {
    color: $gray-1;
  }
  @media (min-width: $lg) {
    background: #fff;
  }
}

.icon--help {
  margin-right: 4px;
  transition: all 0.3s ease 0s;
  color: $gray-3;
  margin-left: -6px;
  margin-top: -1px;
  @media (min-width: $lg) {
    color: $navy-3;
  }
}

.body--dark {
  .btn--help {
    background: transparent;
    color: #fff;
    border: 1px solid $gray-4;
  }
  .btn--help:hover {
    background: $astar-blue;
    border: 1px solid transparent;
    .icon--help {
      color: $gray-1;
    }
  }
  .icon--help {
    color: $gray-3;
  }

  .m-btn--help {
    background: transparent;
    color: $gray-3;
    border: 1px solid $gray-4;
  }
  .m-btn--help:hover {
    background: $astar-blue;
    border: 1px solid transparent;
    .icon--help {
      color: $gray-1;
    }
  }
}
</style>
