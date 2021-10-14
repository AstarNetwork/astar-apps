<template>
  <div>
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { providePolkadotContainer } from 'src/config/api/polkadot';
import type { InjectedExtension } from '@polkadot/extension-inject/types';
import { ApiPromise } from '@polkadot/api';

export default defineComponent({
  name: 'PolkadotProvider',
  props: {
    polkadotApi: { type: Object as PropType<ApiPromise>, required: true },
    extensions: {
      type: Object as PropType<InjectedExtension[]>,
      required: true,
    },
  },
  setup(props) {
    if (props.polkadotApi) {
      providePolkadotContainer(props.polkadotApi, props.extensions);
    }
  },
});
</script>
