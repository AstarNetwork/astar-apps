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
          <avatar :url="getCommunityIconUrl(community.type)" class="avatar" />
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
import {
  Community,
  CommunityDefinition,
  CommunityType,
  NewDappItem,
} from 'src/store/dapp-staking/state';
import ItemsContainer from 'src/components/dapp-staking/register/ItemsContainer.vue';
import ImageCard from 'src/components/dapp-staking/register/ImageCard.vue';
import AddItemCard from 'src/components/dapp-staking/register/AddItemCard.vue';
import Avatar from 'src/components/common/Avatar.vue';
import ModalAddCommunity from 'src/components/dapp-staking/register/ModalAddCommunity.vue';
import { useI18n } from 'vue-i18n';
import { isUrlValid } from 'src/components/common/Validators';

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
        type: CommunityType.Discord,
        handle: '',
        iconUrl: require('src/assets/img/discord.png'),
        label: t('dappStaking.modals.community.discordAccount'),
        validateHandle: (x) => validateUrl(x),
      },
      {
        type: CommunityType.Twitter,
        handle: '',
        iconUrl: require('src/assets/img/twitter.png'),
        label: t('dappStaking.modals.community.twitterAccount'),
        validateHandle: (x) => validateUrl(x),
      },
      {
        type: CommunityType.Reddit,
        handle: '',
        iconUrl: require('src/assets/img/reddit.png'),
        label: t('dappStaking.modals.community.redditAccount'),
        validateHandle: (x) => validateUrl(x),
      },
      {
        type: CommunityType.Facebook,
        handle: '',
        iconUrl: require('src/assets/img/facebook.png'),
        label: t('dappStaking.modals.community.facebookAccount'),
        validateHandle: (x) => validateUrl(x),
      },
      {
        type: CommunityType.YouTube,
        handle: '',
        iconUrl: require('src/assets/img/youtube.png'),
        label: t('dappStaking.modals.community.youtubeAccount'),
        validateHandle: (x) => validateUrl(x),
      },
      {
        type: CommunityType.Instagram,
        handle: '',
        iconUrl: require('src/assets/img/instagram.png'),
        label: t('dappStaking.modals.community.instagramAccount'),
        validateHandle: (x) => validateUrl(x),
      },
    ]);

    const updateCommunities = (communities: Community[]): void => {
      console.log(communities);
      data.communities = communities;
      handleModalAddCommunity({ isOpen: false });
    };

    const handleModalAddCommunity = ({ isOpen }: { isOpen: boolean }) => {
      isModalAddCommunity.value = isOpen;
    };

    const getCommunityIconUrl = (communityType: CommunityType): string => {
      const url = availableCommunities.value.find((x) => x.type === communityType);

      return url ? url.iconUrl : 'TODO dummy icon';
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
      getCommunityIconUrl,
      removeCommunity,
      editCommunity,
      addCommunity,
      handleModalAddCommunity,
      validateUrl,
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
