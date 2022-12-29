<template>
  <div>
    <div>Notification Stack</div>
    <div class="stack--wrapper">
      <div v-for="(t, index) in alertStack" :key="index">
        <NotificationBar :alert-type="t.alertType" :show="true" @close="() => closeNoti(index)">
          <div>
            <div class="message">{{ t.alertMsg }}</div>
            <astar-button class="btn--check">Check your transactions</astar-button>
          </div>
        </NotificationBar>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
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
  z-index: 10;
  top: 104px;
  right: 70px;
  width: 255px;
  height: 100%;
  text-align: center;
  gap: 10px;
  @media (min-width: $lg) {
    top: 96px;
  }
}

.btn--check {
  width: 90%;
  height: 25px;
  margin: 10px;
}
</style>
