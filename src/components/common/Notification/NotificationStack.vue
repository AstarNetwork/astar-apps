<template>
  <div>
    <div>Notification Stack</div>
    <div class="stack--wrapper">
      <div v-for="(t, index) in alertStack" :key="index">
        <notification-bar
          :alert-type="t.alertType"
          :alert-msg="t.alertMsg"
          :tx-hash="t.txHash"
          :show="true"
          @close="() => closeNoti(index)"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useNetworkInfo } from 'src/hooks';
import { endpointKey } from 'src/config/chainEndpoints';
import { AlertType } from 'src/store/general/state';
import { useStore } from 'src/store';
import NotificationBar from './NotificationBar.vue';

export default defineComponent({
  components: { NotificationBar },
  setup() {
    const store = useStore();
    const alertStack = computed(() => store.getters['general/alertStack']);

    //Test
    store.dispatch(
      'general/showAlertMsg',
      {
        msg: 'Test1',
        alertType: AlertType.Success,
        txHash: '0x06a146789e92cc724ba044e1f1c6c8d2aefb4e1f18da46166898d4d83a7deebf',
      },
      { root: true }
    );
    store.dispatch(
      'general/showAlertMsg',
      {
        msg: 'Test2 - Warning',
        alertType: AlertType.Warning,
      },
      { root: true }
    );

    setTimeout(() => {
      store.dispatch(
        'general/showAlertMsg',
        {
          msg: 'Test3 - Error',
          alertType: AlertType.Error,
        },
        { root: true }
      );
    }, 2000);
    ////

    const closeNoti = (index: number) => {
      store.dispatch(
        'general/removeAlertMsg',
        {
          index: index,
        },
        { root: true }
      );
    };

    const { currentNetworkIdx } = useNetworkInfo();
    const isShiden = computed(() => currentNetworkIdx.value === endpointKey.SHIDEN);
    const goToSubscan = (txHash: string) => {
      if (!txHash) return;

      let rootName = 'astar';
      if (isShiden.value) {
        rootName = 'shiden';
      }
      const link = `https://${rootName}.subscan.io/extrinsic/${txHash}`;
      window.open(link, '_blank');
    };

    return { alertStack, AlertType, closeNoti, goToSubscan };
  },
});
</script>
<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';
.stack--wrapper {
  display: flex;
  flex-direction: column;
  position: fixed;
  z-index: 10;
  top: 104px;
  right: 80px;
  width: 255px;
  height: 100%;
  text-align: center;
  gap: 10px;
  @media (min-width: $lg) {
    top: 96px;
  }
}
</style>
