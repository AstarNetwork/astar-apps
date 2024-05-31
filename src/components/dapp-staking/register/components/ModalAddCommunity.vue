<template>
  <modal-wrapper
    :is-modal-open="show"
    :title="$t('dappStaking.modals.community.title')"
    :is-closing="isClosingModal"
    :close-modal="closeModal"
  >
    <div class="community-wrapper">
      <q-form ref="communityForm" class="form--communities">
        <q-input
          v-for="(community, index) in availableCommunities"
          :key="index"
          v-model="community.handle"
          :label="community.label"
          outlined
          label-color="input-label"
          input-class="input"
          :input-style="{ fontWeight: 'bold' }"
          lazy-rules="ondemand"
          :rules="[
            (v: string) => community.validateHandle && community.validateHandle(v) || 'dd',
            (v: string) => validateAtLeastOneLink(v) || `${$t('dappStaking.modals.community.communityRequired')}`]"
          class="component"
        />

        <div class="validation-warning">
          <li>{{ $t('dappStaking.modals.community.communityRequired') }}</li>
        </div>

        <astar-button class="button--confirm" @click="handleConfirm">
          {{ $t('confirm') }}
        </astar-button>
      </q-form>
    </div>
  </modal-wrapper>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { fadeDuration } from '@astar-network/astar-ui';
import { CommunityDefinition } from 'src/staking-v3';
import { wait, Community } from '@astar-network/astar-sdk-core';
import ModalWrapper from 'src/components/common/ModalWrapper.vue';

export default defineComponent({
  components: {
    ModalWrapper,
  },
  props: {
    show: {
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

    const validateAtLeastOneLink = (url: string): boolean =>
      props.availableCommunities.filter((x) => x.handle != '')?.length > 0;

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
      validateAtLeastOneLink,
    };
  },
});
</script>

<style lang="scss" scoped>
@use '../styles/register.scss';

.component {
  margin-bottom: 4px;
}

.community-wrapper {
  margin-top: 10px;
}

.form--communities {
  display: flex;
  flex-direction: column;
  padding: 0 32px;
  padding-bottom: 36px;
  @media (min-width: $sm) {
    padding: 0;
  }
}

.button--confirm {
  width: 100%;
  font-size: 22px;
  font-weight: 600;
  height: 44px;
  align-self: center;
}
</style>
