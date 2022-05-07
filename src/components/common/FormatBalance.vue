<template>
  <balance :balance="balance" :decimals="decimal" :unit="defaultUnitToken" />
</template>
<script lang="ts">
import { defineComponent, toRefs, PropType } from 'vue';
import { useChainMetadata } from 'src/hooks';
import BN from 'bn.js';

import Balance from 'components/common/Balance.vue';

export default defineComponent({
  components: { Balance },
  props: {
    balance: {
      type: Object as PropType<BN> | Object as PropType<string> | undefined,
      required: true,
    },
  },
  setup(props) {
    const { defaultUnitToken, decimal } = useChainMetadata();

    return {
      defaultUnitToken,
      decimal,
      ...toRefs(props),
    };
  },
  methods: {},
});
</script>
