<template>
  <astar-modal
    :is-modal-open="isModalAddCommunity"
    :title="$t('dappStaking.modals.community.title')"
    :is-closing="isClosingModal"
    :close-modal="closeModal"
  >
    <div class="community-wrapper">
      <q-form ref="communityForm">
        <q-input
          v-for="(community, index) in availableCommunities"
          :key="index"
          v-model="community.handle"
          :label="community.label"
          standout="text-white"
          label-color="input-label"
          input-class="input"
          :input-style="{ fontWeight: 'bold' }"
          :rules="[(v: string) => community.validateHandle && community.validateHandle(v)]"
          class="component"
        />

        <button class="btn btn--confirm btn-size-adjust" @click="handleConfirm">
          {{ $t('confirm') }}
        </button>
      </q-form>
    </div>
  </astar-modal>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { fadeDuration } from '@astar-network/astar-ui';
import { Community, CommunityDefinition } from 'src/store/dapp-staking/state';
import AstarModal from 'src/components/common/AstarModal.vue';
import { wait } from 'src/hooks/helper/common';

export default defineComponent({
  components: {
    AstarModal,
  },
  props: {
    isModalAddCommunity: {
      type: Boolean,
      required: true,
    },
    handleModalCommunity: {
      type: Function,
      required: true,
    },
    availableCommunities: {
      type: Object as PropType<CommunityDefinition[]>,
      required: true,
    },
    updateCommunities: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const isClosingModal = ref<boolean>(false);
    const communityForm = ref();

    const closeModal = async (): Promise<void> => {
      isClosingModal.value = true;

      await wait(fadeDuration);
      props.handleModalCommunity({ isOpen: false });
      isClosingModal.value = false;
    };

    const handleConfirm = (): void => {
      communityForm?.value?.validate().then(async (success: boolean) => {
        if (success) {
          // filter communities with entered data
          const communities: Community[] = props.availableCommunities
            .filter((x) => x.handle !== '')
            .map((x) => {
              return {
                type: x.type,
                handle: x.handle,
              };
            });
          props.updateCommunities(communities);
        }
      });
    };

    return {
      isClosingModal,
      communityForm,
      closeModal,
      handleConfirm,
    };
  },
});
</script>

<style scoped>
.component {
  margin-bottom: 20px;
}

.community-wrapper {
  margin-top: 20px;
}
</style>
