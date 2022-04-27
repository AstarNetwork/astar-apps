<template>
  <div :class="isShow && 'wrapper--modal-drawer'" @click="closeHandler">
    <div
      class="animate__animated animate__faster modal"
      :class="[isClosing ? slideOutClass : slideInClass, isShow && 'show']"
    >
      <div class="modal-content">
        <div class="row--close">
          <span class="close">&times;</span>
        </div>
        <div class="title">{{ title }}</div>
        <slot />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, toRefs } from 'vue';

const slideInClass = 'animate__slideInRight';
const slideOutClass = 'animate__slideOutRight';

export default defineComponent({
  name: 'ModalDrawer',
  props: {
    isShow: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
    isClosing: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const animation = ref<string>(slideInClass);

    const closeHandler = (e: any) => {
      const closeClass =
        e.target.className === 'wrapper--modal-drawer' || e.target.className === 'close';
      if (closeClass) {
        emit('close');
      }
    };

    return {
      ...toRefs(props),
      animation,
      slideOutClass,
      slideInClass,
      closeHandler,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';
@import 'src/css/utils.scss';

.wrapper--modal-drawer {
  position: absolute;
  width: 100vw;
  height: 100vh;
  height: calc(100vh - 104px);
  background: transparent;
  z-index: 100;
  @media (min-width: $lg) {
    height: calc(100vh - 96px);
  }
}

.modal {
  display: none; /* Hidden by default */
  position: fixed;
  z-index: 10;
  top: 104px;
  right: 0px;
  width: 395px;
  height: 100%;
  text-align: center;
  background: rgba(255, 255, 255, 0.5);
  box-shadow: -1px 0px 3px rgba(0, 0, 0, 0.1);
  @media (min-width: $lg) {
    top: 96px;
  }
}
.modal.show {
  display: flex;
}

.modal-content {
  border-radius: 6px;
  background-color: $gray-1;
  border: 0px solid transparent;
  padding: 20px 35px;
  width: 100%;
  height: 100%;
  overflow-y: auto;

  @media (min-width: $xs) {
    width: 375px;
  }
  @media (min-width: $sm) {
    width: 395px;
  }
}

.title {
  display: flex;
  justify-content: flex-start;
  font-style: normal;
  font-weight: 590;
  font-size: rem(22);
  line-height: 27px;
  letter-spacing: -0.02em;
  margin-left: 5px;
  margin-top: -17px;
  color: $gray-5;
}

.row--close {
  display: flex;
  justify-content: flex-end;
}

.close {
  display: flex;
  color: #b1b7c1;
  justify-content: flex-end;
  font-size: rem(32);
  font-weight: 330;
  cursor: pointer;
  margin-top: 3px;
  margin-right: 12px;
  @media (min-width: $sm) {
    margin-right: 12.8px;
  }
}
.close:hover {
  color: #d8e2f1;
}

.body--dark {
  .modal {
    background-color: $gray-5;
    box-shadow: -2px 0px 6px rgba(0, 0, 0, 0.25);

    .modal-content {
      background-color: $gray-5;

      .title {
        color: $gray-1;
      }
    }
  }
}

@media screen and (max-width: $sm) {
  .modal {
    top: 0px;
    left: 0px;
    right: 0px;
    width: 100%;
    height: 100%;
    max-height: 100%;
    overflow: auto;
    backdrop-filter: blur(8px);
    @supports (-moz-appearance: none) {
      background: $backdrop-transparent-dark-firefox !important;
    }
  }
  .modal-content {
    width: 100% !important;
    height: auto;
    position: absolute;
    top: 0;
    margin: 0;
    padding-left: 0;
    padding-right: 0;
    padding-bottom: 40px;
    box-shadow: -5px 2px 8px 4px rgba(0, 0, 0, 0.5);
  }
  .title {
    margin-left: 45px;
  }
  .close {
    margin-right: 40px;
  }
}
</style>
