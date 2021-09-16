<template>
  <div 
    class="tw-flex tw-flex-grow tw-border tw-m-4 tw-p-4 tw-w-72 tw-rounded-lg tw-cursor-pointer"
    @click="emitClickEvent">
    <img :src="dapp.iconUrl" class="tw-w-14 tw-h-14 tw-rounded-full image-shadow" />
    <div class="tw-ml-4">
      <div class="tw-text-lg tw-font-semibold">{{ dapp.name }}</div>
      <div class="tw-h-11 tw-overflow-ellipsis tw-overflow-y-hidden">{{ dapp.description }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue'

export default defineComponent({
  props: {
    dapp: {
      type: Object,
      required: true
    }
  },
  setup(props, { emit }) {
    const emitClickEvent = () => {
      emit('dappClick', props.dapp)
    }

    return {
      ...toRefs(props),
      emitClickEvent
    }
  },
})
</script>

<style scoped>
  .image-shadow {
    box-shadow: 0 4px 12px rgba(0,34,51,.08),0 2px 4px rgba(0,34,51,.16);
  }
</style>
