<template>
  <Button class="tw-ml-4" @click="showRegisterDappModal = true">
    <icon-base class="tw-w-5 tw-h-5 tw-text-white tw--ml-1" stroke="currentColor" icon-name="plus">
      <icon-plus />
    </icon-base>
    {{ $t('store.registerDapp') }}
  </Button>

  <ModalRegisterDapp v-if="showRegisterDappModal" v-model:isOpen="showRegisterDappModal" />
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import IconPlus from 'components/icons/IconPlus.vue';
import IconBase from 'components/icons/IconBase.vue';
import ModalRegisterDapp from 'components/store/modals/ModalRegisterDapp.vue';
import Button from 'components/common/Button.vue';

export default defineComponent({
  components: {
    IconPlus,
    IconBase,
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
