<template>
  <div>
    <Button class="tw-ml-4" @click="showRegisterDappModal = true">
      <astar-icon-base
        class="tw-w-5 tw-h-5 tw-text-white tw--ml-1"
        stroke="currentColor"
        icon-name="plus"
      >
        <astar-icon-plus />
      </astar-icon-base>
      {{ $t('dappStaking.registerDapp') }}
    </Button>

    <ModalRegisterDapp v-if="showRegisterDappModal" v-model:isOpen="showRegisterDappModal" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import ModalRegisterDapp from 'components/dapp-staking/modals/ModalRegisterDapp.vue';
import Button from 'components/common/Button.vue';

export default defineComponent({
  components: {
    ModalRegisterDapp,
    Button,
  },
  setup() {
    const showRegisterDappModal = ref<boolean>(false);

    return {
      showRegisterDappModal,
    };
  },
});
</script>
