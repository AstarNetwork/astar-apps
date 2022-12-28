<template>
  <div>
    <div>Notification Stack</div>
    <div class="stack--wrapper">
      <div v-for="(t, index) in alertStack" :key="index">
        <NotificationSuccess :show="true" @close="() => closeNoti(index)"
          ><div>{{ t.alertMsg }}</div></NotificationSuccess
        >
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'src/store';
import NotificationSuccess from './NotificationSuccess.vue';

export default defineComponent({
  components: { NotificationSuccess },
  setup(props) {
    const store = useStore();
    const alertStack = computed(() => store.getters['general/alertStack']);

    // const showArr = ref<string[]>();
    // showArr.value = ['Test1', 'Test2', 'Test3'];
    //Test
    store.dispatch(
      'general/showAlertMsg',
      {
        msg: 'Test1',
        alertType: 'success',
      },
      { root: true }
    );
    store.dispatch(
      'general/showAlertMsg',
      {
        msg: 'Test2',
        alertType: 'success',
      },
      { root: true }
    );
    store.dispatch(
      'general/showAlertMsg',
      {
        msg: 'Test3',
        alertType: 'success',
      },
      { root: true }
    );
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

    return { alertStack, closeNoti };
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
</style>
