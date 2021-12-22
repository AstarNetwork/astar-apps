<template>
  <Modal @click="closeModal">
    <template #content>
      <div class="tw-flex tw-flex-col tw-justify-center tw-items-center dark:tw-text-darkGray-100">
        <Avatar :url="dapp.iconUrl" class="tw-w-36 tw-h-36" />
        <div class="tw-my-8 tw-text-2xl tw-font-semibold">{{ dapp.name }}</div>
        <div>{{ dapp.description }}</div>
        <div class="tw-my-8 tw-w-full tw-text-lg">
          <a :href="dapp.url" target="_blank">{{ dapp.url }}</a>
        </div>
        <p class="tw-w-full">
          {{ $t('dappStaking.modals.contractAddress', { address: dapp.address }) }}
        </p>
      </div>
      <div class="tw-mt-6 tw-flex tw-justify-center">
        <Button type="button" :primary="false" @click="closeModal">{{ $t('close') }}</Button>
      </div>
    </template>
  </Modal>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue';
import Modal from 'components/common/Modal.vue';
import Avatar from 'components/common/Avatar.vue';
import Button from 'src/components/common/Button.vue';

export default defineComponent({
  components: {
    Modal,
    Avatar,
    Button,
  },
  props: {
    dapp: {
      type: Object,
      required: true,
    },
  },
  emits: ['update:is-open'],
  setup(props, { emit }) {
    const closeModal = () => {
      emit('update:is-open', false);
    };

    return {
      closeModal,
      ...toRefs(props),
    };
  },
});
</script>
