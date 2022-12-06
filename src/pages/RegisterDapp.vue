<template>
  <register-dapp />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMeta } from 'quasar';
import RegisterDapp from 'src/components/dapp-staking-v2/register/RegisterDapp.vue';

export default defineComponent({
  components: { RegisterDapp },
  setup() {
    useMeta({ title: 'Register dapp' });
  },
});
</script>
