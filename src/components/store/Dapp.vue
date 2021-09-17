<template>
  <div 
    class="tw-flex tw-flex-grow tw-border tw-m-4 tw-p-4 tw-w-72 tw-rounded-lg tw-cursor-pointer"
    @click="emitClickEvent">
    <Avatar :url="dapp.iconUrl" class="tw-w-14 tw-h-14" />
    <div class="tw-ml-4">
      <div class="tw-text-lg tw-font-semibold">{{ dapp.name }}</div>
      <div class="tw-h-11 tw-overflow-ellipsis tw-overflow-y-hidden">{{ dapp.description }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue'
import Avatar from 'components/common/Avatar.vue';

export default defineComponent({
  props: {
    dapp: {
      type: Object,
      required: true
    }
  },
  components: {
    Avatar
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
