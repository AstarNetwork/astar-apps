<template>
  <img :src="url" class="tw-w-14 tw-h-14 tw-rounded-full image-shadow" />
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue'

export default defineComponent({
  props: {
    url: {
      type: string,
      required: true
    }
  },
  setup(props) {
    return {
      ...toRefs(props)
    }
  },
})
</script>


<style scoped>
  .image-shadow {
    box-shadow: 0 4px 12px rgba(0,34,51,.08),0 2px 4px rgba(0,34,51,.16);
  }
</style>