<template>
  <div>
    <div class="statusTxt">
      {{ timestamp }}
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, watchEffect } from 'vue';
import { useApi } from 'src/hooks';

export default defineComponent({
  setup() {
    const { api } = useApi();

    const timestamp = ref();

    watchEffect(async () => {
      timestamp.value = await api?.value?.query.timestamp?.now();
    });

    return {
      timestamp,
    };
  },
});
</script>
<style scoped>

</style>
