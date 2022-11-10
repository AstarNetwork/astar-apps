<template>
  <register-dapp />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMeta } from 'quasar';
import RegisterDapp from 'src/components/dapp-staking/RegisterDapp.vue';

export default defineComponent({
  components: { RegisterDapp },
  setup() {
    useMeta({ title: 'Register dapp' });
  },
});
</script>
