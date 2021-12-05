<template>
  <balance :balance="balance" :decimals="decimal" :unit="defaultUnitToken" />
</template>
<script lang="ts">
import { defineComponent, toRefs } from 'vue';
import { useChainMetadata } from 'src/hooks';

import Balance from 'components/common/Balance.vue';

export default defineComponent({
  components: { Balance },
  props: {
    balance: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const { defaultUnitToken, decimal } = useChainMetadata();
    // console.log('unit', defaultUnitToken.value);
    return {
      defaultUnitToken,
      decimal,
      ...toRefs(props),
    };
  },
  methods: {},
});
</script>
