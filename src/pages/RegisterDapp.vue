<template>
  <register-dapp v-if="isReady" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMeta } from 'quasar';
import RegisterDapp from 'src/components/dapp-staking/register/RegisterDapp.vue';
import { generateMeta } from 'src/config/metadata';
import { Path } from 'src/router';
import { usePageReady } from 'src/hooks';

export default defineComponent({
  components: { RegisterDapp },
  setup() {
    useMeta(generateMeta(Path.Register));
    const { isReady } = usePageReady();
    return { isReady };
  },
});
</script>
