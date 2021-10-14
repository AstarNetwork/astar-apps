<template>
  <div v-if="messages">
    <Message v-for="message in messages" :key="message.identifier" :message="message" />
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue';
import Message from 'components/dapps/Message.vue';
import { MessageType } from 'src/hooks/types/Message';

export default defineComponent({
  props: {
    messages: {
      required: true,
      type: Array as PropType<MessageType[] | null>,
    },
  },
  components: { Message },
});
</script>
