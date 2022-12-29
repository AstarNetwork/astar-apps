<template>
  <div
    :class="[
      'noti',
      alertType,
      'animate__animated',
      show && 'show',
      show ? 'animate__fadeInRight' : 'animate__fadeOutRight',
    ]"
  >
    <div class="noti-content">
      <div class="row--close">
        <div class="column--title">{{ alertTypeTitle }}</div>
        <div class="column--close" @click="close">
          <IconClose />
        </div>
      </div>
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { AlertType } from 'src/store/general/state';
import { defineComponent, toRefs, PropType, computed } from 'vue';
import IconClose from './IconClose.vue';

export default defineComponent({
  name: 'NotificationBar',
  components: { IconClose },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    alertType: {
      type: String as PropType<AlertType>,
      required: true,
    },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const close = () => {
      emit('close');
    };

    const alertTypeTitle = computed(
      () => props.alertType.charAt(0).toUpperCase() + props.alertType.slice(1)
    );

    return {
      ...toRefs(props),
      alertTypeTitle,
      close,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';
.noti {
  display: none;
  background: #fff;
  border: 1px solid $astar-blue;
  border-radius: 6px;
  color: $gray-5-selected;
  width: 300px;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    background: $astar-blue;
    height: 100%;
    width: 8px;
    border-top-left-radius: 6px;
    border-bottom-left-radius: 6px;
  }
}

.warning {
  border-color: $warning-yellow;

  &::before {
    background: $warning-yellow;
  }
}

.error {
  border-color: $warning-red;

  &::before {
    background: $warning-red;
  }
}

.noti.show {
  display: block;
}

.row--close {
  display: flex;
  color: #b1b7c1;
  justify-content: space-between;
  font-weight: 330;
  margin-right: rem(12.8);
  height: rem(30);
}

.column--title {
  display: flex;
  justify-content: center;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 22px;
  line-height: 27px;
  letter-spacing: -0.02em;
  color: $gray-5-selected;
  margin: 10px;
}

.column--close {
  width: 40px;
  height: 40px;
  border: 1px solid $gray-3;
  border-radius: 30px;
  color: $gray-3;
  font-size: 30px;
  font-weight: 10;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    color: $astar-blue;
    border-color: $astar-blue;
  }
}

.body--dark {
  .column-title {
    color: $gray-1;
  }
  .column--close {
    color: $gray-4;
    border-color: $gray-4;
    &:hover {
      color: $astar-blue;
      border-color: $astar-blue;
    }
  }
}
</style>
