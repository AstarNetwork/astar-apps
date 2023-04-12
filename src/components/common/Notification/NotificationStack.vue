<template>
  <div>
    <div class="stack--wrapper">
      <div v-for="(t, index) in alertStack" :key="index">
        <notification-bar
          :alert-type="t.alertType"
          :alert-msg="t.alertMsg"
          :subscan-url="t.subscanUrl"
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
import { AlertBox, AlertType } from 'src/store/general/state';
import { useStore } from 'src/store';
import NotificationBar from './NotificationBar.vue';

export default defineComponent({
  components: { NotificationBar },
  setup() {
    const store = useStore();
    const closeNoti = (index: number) => {
      store.dispatch(
        'general/removeAlertMsg',
        {
          index: index,
        },
        { root: true }
      );
    };

    const alertStack = computed<AlertBox[]>(() => store.getters['general/alertStack']);
    const { currentNetworkIdx } = useNetworkInfo();
    const isShiden = computed<boolean>(() => currentNetworkIdx.value === endpointKey.SHIDEN);

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
  z-index: 120;
  top: 104px;
  left: 0;
  right: 0;
  margin: auto;
  width: 340px;
  max-height: calc(100vh - 110px);
  text-align: center;
  overflow-y: auto;
  overflow-x: hidden;
  gap: 10px;
  padding-top: 16px;
  @media (min-width: $md) {
    top: 96px;
    left: auto;
    right: 40px;
  }
}
</style>
