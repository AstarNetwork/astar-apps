<template>
  <Modal :title="`Claim reward ${dapp.name}`">
    <template v-slot:content>
      <Avatar :url="dapp.iconUrl" class="tw-w-36 tw-h-36 tw-mb-4 tw-mx-auto"/>
      <div class="tw-my-4">Unclaimed rewards <span class="tw-font-semibold">1288 SBY</span></div>
      <div class="tw-my-4">Your rewards <span class="tw-font-semibold">144 SBY</span></div>
    </template>
    <template v-slot:buttons>
      <Button>Claim</Button>
    </template>
  </Modal>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue'
import Modal from 'src/components/common/Modal.vue';
import Button from 'src/components/common/Button.vue';
import Avatar from 'src/components/common/Avatar.vue';

export default defineComponent({
  props: {
    dapp: {
      type: Object,
      required: true
    }
  },
  components: {
    Modal,
    Button,
    Avatar
  },
  setup(props) {
    return {
      ...toRefs(props)
    };
  },
})
</script>
