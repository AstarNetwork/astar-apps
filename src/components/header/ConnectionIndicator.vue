<template>
  <div class="wrapper--indicator">
    <div class="dot" :class="getDotClass(connectionType)"></div>
    <div v-if="width >= screenSize.sm" class="txt--status" :class="getDotClass(connectionType)">
      <div>{{ connectionType }}</div>
      <div v-if="connectionType === 'connected'">v{{ version }}</div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { useBreakpoints } from 'src/hooks';

export default defineComponent({
  props: {
    connectionType: {
      type: String,
      default: 'connected',
      required: true,
    },
    version: {
      type: String,
      default: '0.0.0',
    },
  },
  setup() {
    const { width, screenSize } = useBreakpoints();

    return {
      width,
      screenSize,
    };
  },
  methods: {
    getDotClass(connectionType: string) {
      if (connectionType === 'connecting') {
        return 'orange';
      } else if (connectionType === 'connected') {
        return 'green';
      } else if (connectionType === 'offline') {
        return 'red';
      }
    },
  },
});
</script>
<style style="scss" scoped>
@import 'src/css/quasar.variables.scss';

.wrapper--indicator {
  display: flex;
  align-items: center;
}
.dot {
  height: 7px;
  width: 7px;
  border-radius: 90%;
}
.dot.green {
  background-color: #00ff00;
}
.dot.orange {
  background-color: #ffa500;
}
.dot.red {
  background-color: #ff0000;
}
.txt--status {
  font-weight: 400;
  font-size: 9px;
  line-height: 11px;
  text-align: left;
  color: $gray-3;
  margin-left: 5px;
}
</style>
