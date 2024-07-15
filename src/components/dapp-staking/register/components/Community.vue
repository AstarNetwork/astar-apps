<template>
  <div>
    <items-container
      :title="$t('dappStaking.modals.communityLabel')"
      :validation-error="validationError"
      class="component"
    >
      <div class="community--container">
        <image-card
          v-for="(community, index) in data.communities"
          :key="index"
          :description="community.type"
          :can-remove-card="true"
          @remove="removeCommunity(index)"
          @click="editCommunity()"
        >
          <avatar :icon-name="getCommunityIconName(community.type) as SocialIcon" class="avatar" />
        </image-card>
        <image-card description="Add an account" class="card">
          <add-item-card @click="addCommunity" />
        </image-card>
      </div>
    </items-container>

    <teleport to="#app--main">
      <div :class="'highest-z-index'">
        <modal-add-community
          v-model:is-open="isModalAddCommunity"
          :show="isModalAddCommunity"
          :handle-modal-community="handleModalAddCommunity"
          :available-communities="availableCommunities"
          :update-communities="updateCommunities"
        />
      </div>
    </teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, ref, watch } from 'vue';
import ItemsContainer from './ItemsContainer.vue';
import ImageCard from './ImageCard.vue';
import AddItemCard from './AddItemCard.vue';
import Avatar from 'src/components/common/Avatar.vue';
import ModalAddCommunity from './ModalAddCommunity.vue';
import { useI18n } from 'vue-i18n';
import { isUrlValid } from 'src/components/common/Validators';
import { SocialIcon } from '@astar-network/astar-ui';
import { Community, CommunityType } from '@astar-network/astar-sdk-core';
import { CommunityDefinition, NewDappItem } from 'src/staking-v3';

export default defineComponent({
  components: {
    ItemsContainer,
    ImageCard,
    AddItemCard,
    Avatar,
    ModalAddCommunity,
  },
  props: {
    dapp: {
      type: Object as PropType<NewDappItem>,
      required: true,
    },
    validationError: {
      type: String,
      default: '',
    },
  },
  emits: ['dappChanged'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const data = reactive<NewDappItem>(props.dapp);
    const isModalAddCommunity = ref<boolean>(false);
    const availableCommunities = ref<CommunityDefinition[]>([
      {
        type: CommunityType.GitHub,
        handle: '',
        iconName: SocialIcon.Github,
        label: t('dappStaking.modals.community.githubAccount'),
        validateHandle: (x) => validateUrl(x),
      },
      {
        type: CommunityType.Discord,
        handle: '',
        iconName: SocialIcon.Discord,
        label: t('dappStaking.modals.community.discordAccount'),
        validateHandle: (x) => validateUrl(x),
      },
      {
        type: CommunityType.Twitter,
        handle: '',
        iconName: SocialIcon.Twitter,
        label: t('dappStaking.modals.community.twitterAccount'),
        validateHandle: (x) => validateUrl(x),
      },
      {
        type: CommunityType.Reddit,
        handle: '',
        iconName: SocialIcon.Reddit,
        label: t('dappStaking.modals.community.redditAccount'),
        validateHandle: (x) => validateUrl(x),
      },
      {
        type: CommunityType.Facebook,
        handle: '',
        iconName: SocialIcon.Facebook,
        label: t('dappStaking.modals.community.facebookAccount'),
        validateHandle: (x) => validateUrl(x),
      },
      {
        type: CommunityType.YouTube,
        handle: '',
        iconName: SocialIcon.Youtube,
        label: t('dappStaking.modals.community.youtubeAccount'),
        validateHandle: (x) => validateUrl(x),
      },
      {
        type: CommunityType.Instagram,
        handle: '',
        iconName: SocialIcon.Instagram,
        label: t('dappStaking.modals.community.instagramAccount'),
        validateHandle: (x) => validateUrl(x),
      },
    ]);

    const updateCommunities = (communities: Community[]): void => {
      data.communities = communities;
      handleModalAddCommunity({ isOpen: false });
    };

    const handleModalAddCommunity = ({ isOpen }: { isOpen: boolean }) => {
      isModalAddCommunity.value = isOpen;
    };

    const getCommunityIconName = (communityType: CommunityType): string => {
      const url = availableCommunities.value.find((x) => x.type === communityType);

      return url ? url.iconName : 'TODO dummy icon';
    };

    const addCommunity = () => {
      availableCommunities.value.forEach((x) => {
        const community = data.communities.find((y) => y.type === x.type);
        x.handle = community ? community.handle : '';
      });
      handleModalAddCommunity({ isOpen: true });
    };

    const removeCommunity = (index: number): void => {
      data.communities.splice(index, 1);
    };

    const editCommunity = (): void => {
      addCommunity();
    };

    const validateUrl = (url: string): boolean | string =>
      (url !== '' ? isUrlValid(url) : true) || t('dappStaking.modals.builder.error.invalidUrl');

    watch(
      () => data,
      () => {
        emit('dappChanged', data);
      },
      { deep: true }
    );

    return {
      data,
      isModalAddCommunity,
      availableCommunities,
      updateCommunities,
      getCommunityIconName,
      removeCommunity,
      editCommunity,
      addCommunity,
      handleModalAddCommunity,
      validateUrl,
      SocialIcon,
    };
  },
});
</script>

<style lang="scss" scoped>
.community--container {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
}
.avatar {
  text-align: center;
  width: 60px;
  height: 60px;
}

.card {
  margin-top: 8px;
  margin-right: 12px;
}
</style>
