<template>
  <balance :balance="balance" :decimals="decimal" :unit="tokenUnit" />
</template>
<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useChainMetadata } from 'src/hooks';
import { BN } from '@polkadot/util';

import Balance from 'components/common/Balance.vue';

export default defineComponent({
  components: { Balance },
  props: {
    balance: {
      type: [BN, String],
      required: true,
    },
    showTokenUnit: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  setup(props) {
    const { defaultUnitToken, decimal } = useChainMetadata();
    const tokenUnit = computed<string>(() => (props.showTokenUnit ? defaultUnitToken.value : ''));

    return {
      decimal,
      tokenUnit,
    };
  },
  methods: {},
});
</script>
