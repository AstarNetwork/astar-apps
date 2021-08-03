<template>
  <div>
    <div class="dot" :class="getDotClass(connectionType)"></div>
    <div class="statusTxt" :class="getDotClass(connectionType)">
      {{ connectionType }}
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
  margin-left: 9px;
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
  font-size: 7px;
}
.statusTxt.green {
  color: #00ff00;
}
.statusTxt.orange {
  color: #ffa500;
}
.statusTxt.red {
  color: #ff0000;
}
</style>
