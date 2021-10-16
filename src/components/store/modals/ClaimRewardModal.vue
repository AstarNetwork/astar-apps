<template>
  <Modal :title="`Claim reward ${dapp.name}`">
    <template #content>
      <Avatar :url="dapp.iconUrl" class="tw-w-36 tw-h-36 tw-mb-4 tw-mx-auto" />
      <div>
        {{ $t('store.modals.alreadyClaimed') }}
      </div>
      <div class="tw-mt-4">
        <span class="tw-w-40 tw-inline-block"> {{ $t('store.modals.contractRewards') }}</span>
        <span class="tw-font-semibold">{{ stakeInfo.claimedRewards }}</span>
        <br />
        <span class="tw-w-40 tw-inline-block">
          {{ $t('store.modals.yourRewards') }}
        </span>
        <span class="tw-font-semibold">{{ stakeInfo.userClaimedRewards }}</span>
      </div>
    </template>
    <template #buttons>
      <Button disabled class="tw-tooltip" @click="claimAction()">
        {{ $t('store.claim') }}
        <!-- Temporary Tooltip -->
        <!-- Todo: remove this when function is fixed -->
        <span
          class="
            tw-pointer-events-none
            tw-hidden
            tw-absolute
            tw-top-0
            tw-left-1/2
            tw-z-10
            tw-transform
            tw--translate-y-full
            tw--translate-x-1/2
            tw-p-2
            tw-text-xs
            tw-leading-tight
            tw-text-white
            tw-bg-gray-800
            dark:tw-bg-darkGray-500
            tw-rounded-md tw-shadow-lg tw-opacity-90 tw-whitespace-nowrap
          "
          >the claim function has been temporarily disabled due to pallet maintenance</span
        >
      </Button>
    </template>
  </Modal>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue';
import Modal from 'src/components/common/Modal.vue';
import Button from 'src/components/common/Button.vue';
import Avatar from 'src/components/common/Avatar.vue';

export default defineComponent({
  components: {
    Modal,
    Button,
    Avatar,
  },
  props: {
    dapp: {
      type: Object,
      required: true,
    },
    claimAction: {
      type: Function,
      required: true,
    },
    stakeInfo: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    return {
      ...toRefs(props),
    };
  },
});
</script>
