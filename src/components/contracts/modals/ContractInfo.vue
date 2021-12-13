<template>
  <div v-if="messages">
    <Message v-for="message in messages" :key="message.identifier" :message="message" />
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue';
import Message from 'components/contracts/Message.vue';
import { MessageType } from 'src/hooks/types/Message';

export default defineComponent({
  components: { Message },
  props: {
    messages: {
      required: true,
      type: Array as PropType<MessageType[] | null>,
    },
  },
});
</script>
