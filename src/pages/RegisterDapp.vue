<template>
  <register-dapp />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMeta } from 'quasar';
import RegisterDapp from 'src/components/dapp-staking/register/RegisterDapp.vue';
import { meta } from 'src/config/metadata';

export default defineComponent({
  components: { RegisterDapp },
  setup() {
    useMeta({
      title: meta.title.dappsStaking.registerDapp,
      meta: {
        description: {
          name: 'description',
          content: meta.description.dappsStaking,
        },
      },
    });
  },
});
</script>
