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
          <span v-if="isSuccessType || isCopiedType" class="icon--check">
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
      <div v-if="!isCopiedType">
        <div class="message">{{ alertMsg }}</div>
        <astar-button v-if="isSuccessType && explorerUrl" class="btn--check" @click="goToSubscan">
          {{
            $t(
              alertMsg === AlertMsg.SUCCESS_MULTISIG
                ? 'toast.approveOnPolkasafe'
                : 'toast.checkYourTransactions'
            )
          }}
        </astar-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { AlertType } from 'src/store/general/state';
import { useI18n } from 'vue-i18n';
import { defineComponent, toRefs, PropType, computed, ref } from 'vue';
import { AlertMsg } from 'src/modules/toast';
import { navigateInNewTab } from 'src/util-general';

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
    explorerUrl: {
      type: String,
      default: null,
      required: false,
    },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const close = () => {
      emit('close');
    };

    const { t } = useI18n();
    const alertTypeTitle = computed<string>(() => {
      if (props.alertType === AlertType.Success) {
        return t('toast.success');
      } else if (props.alertType === AlertType.Warning) {
        return t('toast.note');
      } else if (props.alertType === AlertType.Error) {
        return t('toast.error');
      } else if (props.alertType === AlertType.Info) {
        return t('toast.info');
      } else {
        return t('toast.copied');
      }
    });

    const showCloseBtn = ref<boolean>(false);
    const isSuccessType = computed<boolean>(() => props.alertType === AlertType.Success);
    const isCopiedType = computed<boolean>(() => props.alertType === AlertType.Copied);

    const goToSubscan = (): void => {
      navigateInNewTab(props.explorerUrl);
    };

    return {
      ...toRefs(props),
      alertTypeTitle,
      isSuccessType,
      isCopiedType,
      showCloseBtn,
      AlertMsg,
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
  color: $navy-1;
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
  color: $navy-1;
}

.column--close {
  width: 16px;
  height: 16px;
  border: 1px solid $gray-4;
  border-radius: 30px;
  color: $gray-4;
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
  color: $navy-1;
  text-align: left;
  padding-left: 12px;
  padding-right: 12px;
  margin-top: 8px;
  word-wrap: break-word;
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
