<template>
  <Modal>
    <div class="tw-flex tw-flex-col tw-justify-center tw-items-center">
      <Avatar :url="dapp.iconUrl" class="tw-w-56 tw-h-56" />
      <div class="tw-my-8 tw-text-2xl tw-font-semibold">{{ dapp.name }}</div>
      <div>{{ dapp.description }}</div>
      <div class="tw-my-8 tw-w-full tw-text-lg">
        <a :href="dapp.url" target="_blank">{{ dapp.url }}</a>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue'
import Modal from 'components/common/Modal.vue';
import Avatar from 'components/common/Avatar.vue';

export default defineComponent({
  props: {
    dapp: {
      type: Object,
      required: true
    }
  },
  components: {
    Modal,
    Avatar
  },
  setup(props) {
    return {
      ...toRefs(props),
    }
  },
})
</script>
