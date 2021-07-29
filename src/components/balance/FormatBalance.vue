<template>
  <balance :balance="balance" :decimals="decimal" :unit="defaultUnitToken" />
</template>
<script lang="ts">
import { defineComponent, inject, ref } from 'vue';
import { useChainMetadata } from 'src/hooks';

import BN from 'bn.js';
import Balance from 'components/common/Balance.vue';

export default defineComponent({
  components: { Balance },
  setup() {
    const { defaultUnitToken, decimal } = useChainMetadata();

    const balance = inject('balance', ref(new BN(0)));

    return {
      defaultUnitToken,
      balance,
      decimal,
    };
  },
  methods: {},
});
</script>
