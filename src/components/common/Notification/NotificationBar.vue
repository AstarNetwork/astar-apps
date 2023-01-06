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
    <div class="noti-content" @mouseover="showCloseBtn = true">
      <div class="row--close">
        <div class="column--title">
          <span v-if="isSuccessType" class="icon--check">
            <astar-icon-circle-check size="20" />
          </span>
          <span v-else class="icon--check">
            <astar-icon-warning size="20" />
          </span>
          {{ alertTypeTitle }}
        </div>
        <div v-if="showCloseBtn" class="column--close" @click="close">
          <astar-icon-close />
        </div>
      </div>
      <div>
        <div class="message">{{ alertMsg }}</div>
        <astar-button v-if="isSuccessType" class="btn--check" @click="goToSubscan"
          >Check your transactions</astar-button
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { AlertType } from 'src/store/general/state';
import { useNetworkInfo } from 'src/hooks';
import { endpointKey } from 'src/config/chainEndpoints';
import { defineComponent, toRefs, PropType, computed, ref } from 'vue';

export default defineComponent({
  name: 'NotificationBar',
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    alertType: {
      type: String as PropType<AlertType>,
      required: true,
    },
    alertMsg: {
      type: String,
      required: true,
    },
    txHash: {
      type: String,
      default: null,
    },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const close = () => {
      emit('close');
    };

    const alertTypeTitle = computed(() => {
      if (props.alertType === AlertType.Success) {
        return 'Success';
      } else if (props.alertType === AlertType.Warning) {
        return 'Note';
      } else {
        return 'Error';
      }
    });
    const showCloseBtn = ref(false);

    const isSuccessType = computed(() => props.alertType === AlertType.Success);
    const { currentNetworkIdx } = useNetworkInfo();
    const isShiden = computed(() => currentNetworkIdx.value === endpointKey.SHIDEN);
    const goToSubscan = () => {
      if (!props.txHash) return;

      let rootName = 'astar';
      if (isShiden.value) {
        rootName = 'shiden';
      }
      const link = `https://${rootName}.subscan.io/extrinsic/${props.txHash}`;
      window.open(link, '_blank');
    };

    return {
      ...toRefs(props),
      alertTypeTitle,
      isSuccessType,
      showCloseBtn,
      goToSubscan,
      close,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';
.noti {
  display: none;
  border: 1px solid $astar-blue;
  border-radius: 6px;
  color: $gray-5-selected;
  width: 100%;
  background: #e5f2ff;
  mix-blend-mode: normal;
  box-shadow: 4px 4px 4px 0px rgb(0 0 0 / 12%);

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
  .icon--check {
    color: $astar-blue;
    margin-left: 8px;
    margin-right: 8px;
  }
}

.noti-content {
  padding: 16px;
}

.warning {
  background: #fdf8e6;
  border-color: $warning-yellow;

  &::before {
    background: $warning-yellow;
  }
  .icon--check {
    color: $warning-yellow;
  }
}

.error {
  background: #ffeee8;
  border-color: $warning-red;

  &::before {
    background: $warning-red;
  }
  .icon--check {
    color: $warning-red;
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
}

.column--title {
  display: flex;
  justify-content: center;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
  color: $gray-5-selected;
}

.column--close {
  width: 16px;
  height: 16px;
  border: 1px solid $gray-3;
  border-radius: 30px;
  color: $gray-3;
  font-size: 30px;
  font-weight: 10;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.message {
  width: 310px;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: $gray-5-selected;
  text-align: left;
  padding-left: 12px;
  padding-right: 12px;
  margin-top: 8px;
  word-break: break-all;
}
.btn--check {
  width: 90%;
  height: 33px;
  margin-top: 10px;
  background: transparent;
  border: 1px solid $astar-blue;
  color: $astar-blue;
}

.body--dark {
  .noti {
    background: #001a33;
    box-shadow: 4px 4px 4px 0px rgb(0 0 0 / 25%);
  }
  .warning {
    background: #302502;
  }
  .error {
    background: #331106;
  }
  .column--title {
    color: $gray-1;
  }
  .column--close {
    color: $gray-4;
    border-color: $gray-4;
  }
  .message {
    color: $gray-1;
  }
}
</style>
