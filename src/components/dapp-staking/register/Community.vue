<template>
  <div>
    <items-container :title="$t('dappStaking.modals.community')" class="component">
      <div class="builders--container">
        <image-card
          v-for="(community, index) in data.communities"
          :key="index"
          :description="community.type"
          :can-remove-card="true"
          @remove="removeCommunity(index)"
          @click="editCommunity(index)"
        >
          <avatar :url="community.iconUrl" class="avatar" />
        </image-card>
        <image-card description="Add an account" class="card">
          <add-item-card @click="addCommunity" />
        </image-card>
      </div>
    </items-container>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, ref } from 'vue';
import { NewDappItem, Community } from 'src/store/dapp-staking/state';
import ItemsContainer from 'src/components/dapp-staking/register/ItemsContainer.vue';
import ImageCard from 'src/components/dapp-staking/register/ImageCard.vue';
import AddItemCard from 'src/components/dapp-staking/register/AddItemCard.vue';
import Avatar from 'src/components/common/Avatar.vue';

export default defineComponent({
  components: {
    ItemsContainer,
    ImageCard,
    AddItemCard,
    Avatar,
  },
  props: {
    dapp: {
      type: Object as PropType<NewDappItem>,
      required: true,
    },
  },
  emits: ['dappChanged'],
  setup(props, { emit }) {
    const data = reactive<NewDappItem>(props.dapp);
    // const currentCommunity = ref<Community>(initDeveloper());
    const isModalAddCommunity = ref<boolean>(false);

    const handleModalAddCommunity = ({ isOpen }: { isOpen: boolean }) => {
      // currentDeveloper.value = initDeveloper();
      isModalAddCommunity.value = isOpen;
    };

    const addCommunity = () => {
      handleModalAddCommunity({ isOpen: true });
    };

    const removeCommunity = (index: number): void => {
      data.communities.splice(index, 1);
    };

    const editCommunity = (index: number): void => {};

    // const handleAddDevelper = (developer: Developer): void => {
    //   data.developers.push(developer);
    //   handleModalAddDeveloper({ isOpen: false });
    // };

    // const handleUpdateDeveloper = (developer: Developer): void => {
    //   const developerIndex = data.developers.findIndex(
    //     (x) => x.name === currentDeveloper.value.name
    //   );
    //   if (developerIndex > -1) {
    //     data.developers[developerIndex] = developer;
    //   } else {
    //     console.warn(`Developer with name ${developer.name} is not found in collection.`);
    //   }

    //   isModalAddDeveloper.value = false;
    // };

    return {
      data,
      removeCommunity,
      editCommunity,
      addCommunity,
    };
  },
});
</script>

<style lang="scss" scoped></style>
