<template>
  <div class="tw-flex tw-items-center">
    <div class="dot" :class="getDotClass(connectionType)"></div>
    <div class="statusTxt" :class="getDotClass(connectionType)">
      <div>{{ connectionType }}</div>
      <div v-if="connectionType === 'connected'">v{{ version }}</div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

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
<style scoped>
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
.statusTxt {
  font-weight: 400;
  font-size: 9px;
  line-height: 11px;
  text-align: left;
  color: #b1b7c1;
  margin-left: 5px;
}
/* .statusTxt.green {
  color: #00ff00;
}
.statusTxt.orange {
  color: #ffa500;
}
.statusTxt.red {
  color: #ff0000;
} */
</style>
