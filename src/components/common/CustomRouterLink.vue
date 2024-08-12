<template>
  <div :class="{ disabled: isDisabled }" @click="handleClick">
    <slot />
  </div>
</template>

<script lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { defineComponent } from 'vue';
import { navigateInNewTab } from 'src/util-general';

export default defineComponent({
  props: {
    to: {
      type: String,
      required: true,
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const router = useRouter();

    const isExternalLink = computed(() => {
      return typeof props.to === 'string' && props.to.startsWith('http');
    });

    const handleClick = (event: MouseEvent) => {
      if (props.isDisabled) {
        event.preventDefault();
      } else {
        if (isExternalLink.value) {
          navigateInNewTab(props.to);
        } else {
          router.push(props.to);
        }
      }
    };

    return {
      handleClick,
    };
  },
});
</script>
