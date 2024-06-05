<template>
  <div>
    <items-container
      :title="$t('dappStaking.modals.builders')"
      :validation-error="validationError"
      class="component"
    >
      <div class="builders--container">
        <image-card
          v-for="(developer, index) in data.developers"
          :key="index"
          :description="developer.name"
          :base64-image="developer.iconFile"
          :can-remove-card="true"
          @remove="removeDeveloper(index)"
          @click="editDeveloper(index)"
        >
        </image-card>
        <image-card
          :description="$t('dappStaking.modals.addAccount')"
          class="card"
          @click="addDeveloper"
        >
          <add-item-card />
        </image-card>
      </div>
    </items-container>

    <teleport to="#app--main">
      <div :class="'highest-z-index'">
        <modal-add-developer
          v-model:is-open="isModalAddDeveloper"
          :show="isModalAddDeveloper"
          :handle-modal-developer="handleModalAddDeveloper"
          :add-developer="handleAddDevelper"
          :update-developer="handleUpdateDeveloper"
          :developer="currentDeveloper"
          :check-if-developer-exists="checkIfDeveloperExists"
        />
      </div>
    </teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, reactive, watch } from 'vue';
import ImageCard from './ImageCard.vue';
import AddItemCard from './AddItemCard.vue';
import ItemsContainer from './ItemsContainer.vue';
import ModalAddDeveloper from './ModalAddDeveloper.vue';
import { Developer } from '@astar-network/astar-sdk-core';
import { NewDappItem } from 'src/staking-v3';

export default defineComponent({
  components: {
    ItemsContainer,
    ImageCard,
    AddItemCard,
    ModalAddDeveloper,
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
    const initDeveloper = (): Developer => ({
      name: '',
      iconFile: '',
      githubAccountUrl: '',
      linkedInAccountUrl: '',
      twitterAccountUrl: '',
    });

    const data = reactive<NewDappItem>(props.dapp);
    const isModalAddDeveloper = ref<boolean>(false);
    const currentDeveloper = ref<Developer>(initDeveloper());

    const handleModalAddDeveloper = ({ isOpen }: { isOpen: boolean }) => {
      currentDeveloper.value = initDeveloper();
      isModalAddDeveloper.value = isOpen;
    };

    const addDeveloper = () => {
      handleModalAddDeveloper({ isOpen: true });
    };

    const removeDeveloper = (index: number): void => {
      data.developers.splice(index, 1);
    };

    const editDeveloper = (index: number): void => {
      currentDeveloper.value = data.developers[index];
      isModalAddDeveloper.value = true;
    };

    const handleAddDevelper = (developer: Developer): void => {
      data.developers.push(developer);
      handleModalAddDeveloper({ isOpen: false });
    };

    const handleUpdateDeveloper = (developer: Developer): void => {
      const developerIndex = data.developers.findIndex(
        (x) => x.name.toLowerCase() === currentDeveloper.value.name.toLowerCase()
      );
      if (developerIndex > -1) {
        data.developers[developerIndex] = developer;
      } else {
        console.warn(`Developer with name ${developer.name} is not found in collection.`);
      }

      isModalAddDeveloper.value = false;
    };

    const checkIfDeveloperExists = (developerName: string): boolean => {
      return (
        data.developers.findIndex(
          (x: Developer) =>
            x.name.toLowerCase() === developerName.toLowerCase() &&
            x.name.toLowerCase() !== currentDeveloper.value.name.toLowerCase()
        ) >= 0
      );
    };

    watch(
      () => data,
      () => {
        emit('dappChanged', data);
      },
      { deep: true }
    );

    return {
      data,
      isModalAddDeveloper,
      currentDeveloper,
      removeDeveloper,
      editDeveloper,
      addDeveloper,
      handleAddDevelper,
      handleUpdateDeveloper,
      handleModalAddDeveloper,
      checkIfDeveloperExists,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/assets.scss';

.component {
  margin-bottom: 20px;
}

.builders--container {
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
