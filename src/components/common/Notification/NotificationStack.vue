<template>
  <div>
    <div class="stack--wrapper">
      <div v-for="(t, index) in alertStack" :key="index">
        <notification-bar
          :alert-type="t.alertType"
          :alert-msg="t.alertMsg"
          :explorer-url="t.explorerUrl"
          :show="true"
          @close="() => closeNoti(index)"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed } from 'vue';
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

    return { alertStack, AlertType, closeNoti };
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
