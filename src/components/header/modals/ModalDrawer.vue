<template>
  <div :class="`modal ${isShow ? 'show' : ''}`">
    <div class="modal-content">
      <span class="close" @click="close">&times;</span>
      <div class="title">{{ title }}</div>
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watchEffect, toRefs } from 'vue';

export default defineComponent({
  name: 'ModalDrawer',
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const isShow = ref(props.show);

    watchEffect(() => {
      if (isShow.value !== props.show) {
        isShow.value = props.show;
      }
    });

    const close = (e: any) => {
      if (e.target.className === 'modal show' || e.target.className === 'close') {
        emit('close');
      }
    };

    return {
      ...toRefs(props),
      isShow,
      close,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';
@import 'src/css/utils.scss';

.modal {
  display: none; /* Hidden by default */
  position: fixed;
  z-index: 10;
  top: 96px;
  right: 0px;
  width: 395px;
  height: 100%;
  // height: auto;
  // max-height: 650px;
  text-align: center;
  background: rgba(255, 255, 255, 0.5);
  box-shadow: -5px 2px 8px 4px rgba(0, 0, 0, 0.5);
}
.modal.show {
  display: flex;
}

.modal-content {
  box-shadow: 0 0 15px 4px #00000030;
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
  color: $gray-5;
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
    background: rgba(25, 29, 31, 0.5);

    .modal-content {
      box-shadow: 0 0 15px 4px #00000080;
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
