<template>
  <Modal :title="`Claim reward ${dapp.name}`">
    <template v-slot:content>
      <Avatar :url="dapp.iconUrl" class="tw-w-36 tw-h-36 tw-mb-4 tw-mx-auto"/>
      <div>
        {{ $t('store.modals.alreadyClaimed') }}
      </div>
      <div class="tw-mt-4">
        <span class="tw-w-40 tw-inline-block">
        {{ $t('store.modals.contractRewards') }}</span>
        <span class="tw-font-semibold">{{ stakeInfo.claimedRewards}}</span>
        <br/>
        <span class="tw-w-40 tw-inline-block">
          {{ $t('store.modals.yourRewards') }}
        </span>
        <span class="tw-font-semibold">{{ stakeInfo.userClaimedRewards}}</span>
      </div>
    </template>
    <template v-slot:buttons>
      <Button @click="claimAction()">
        {{ $t('store.claim') }}
      </Button>
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
    },
    claimAction: {
      type: Function,
      required: true
    },
    stakeInfo: {
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
