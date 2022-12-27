<template>
  <div>
    <div>Notification Stack</div>
    <div class="stack--wrapper">
      <div v-for="(t, index) in showArr" :key="index">
        <NotificationSuccess :show="true"
          ><div>{{ t }}</div></NotificationSuccess
        >
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import NotificationSuccess from './NotificationSuccess.vue';

export default defineComponent({
  components: { NotificationSuccess },
  props: {
    msg: {
      type: String,
      required: true,
    },
    alertType: {
      type: String,
      default: 'success',
      required: true,
    },
  },
  setup(props) {
    const showArr = ['Test1', 'Test2'];

    return { showArr };
  },
});
</script>
<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';
.stack--wrapper {
  position: fixed;
  z-index: 10;
  top: 104px;
  right: 0px;
  width: 255px;
  height: 100%;
  text-align: center;
  @media (min-width: $lg) {
    top: 96px;
  }
}
</style>
