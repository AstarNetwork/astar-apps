<template>
  <div class="wrapper--assets">
    <div class="container--assets">
      <div style="display: flex; flex-direction: column">
        <q-input
          v-model="data.name"
          label="Name"
          standout="text-white"
          label-color="input-label"
          input-class="input"
          :input-style="{ fontWeight: 'bold' }"
          :rules="[(v) => (v && v.length > 0) || 'dApp name is required.']"
          class="component"
        />
        <q-file
          v-model="data.icon"
          standout="text-white"
          counter
          label="Project logo"
          accept=".jpg .png, image/*"
          class="component"
          input-style="{ height: '120px'}"
          @update:model-value="updateDappLogo()"
        >
          <template #file="{ file }">
            <image-card :base64-image="data.iconFile" :description="file.name" class="card">
              <add-item-card />
            </image-card>
          </template>
        </q-file>

        <q-input
          v-model="data.address"
          label="Contract address"
          standout="text-white"
          label-color="input-label"
          input-class="input"
          :input-style="{ fontWeight: 'bold' }"
          :rules="[(v) => isValidAddress(v) || 'Enter a valid EVM or SS58 contract address.']"
          class="component"
        />

        <q-input
          v-model="data.url"
          label="Project URL"
          standout="text-white"
          label-color="input-label"
          input-class="input"
          :input-style="{ fontWeight: 'bold' }"
          :rules="[
            (v) => v !== '' || 'Enter project url.',
            (v) => isUrlValid(v) || 'Invalid project url.',
          ]"
          class="component"
        />

        <q-file
          v-model="data.images"
          standout="bg-blue-grey-10 text-white"
          multiple
          append
          max-file-size="1000000"
          accept=".jpg .png, image/*"
          label="Screenshots (Max. file size 1MB)"
          class="component"
          :rules="[(v) => (v && v.length >= 4) || 'At least 4 dApp images are required.']"
          @update:model-value="updateDappImages()"
        >
          <template #file="{ file, index }">
            <image-card
              :base64-image="data.imagesContent[index]"
              :description="file.name"
              class="card"
            >
              <add-item-card />
            </image-card>
          </template>
        </q-file>

        <items-container title="Builders information">
          <image-card description="Add an account" class="card">
            <add-item-card @click="addDeveloper" />
          </image-card>
        </items-container>
      </div>
    </div>

    <modal-add-developer
      :is-modal-add-developer="isModalAddDeveloper"
      :handle-modal-developer="handleModalAddDeveloper"
      :developer="currentDeveloper"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref, watch } from 'vue';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { useStore } from 'src/store';
import { Developer, NewDappItem } from 'src/store/dapp-staking/state';
import ImageCard from './ImageCard.vue';
import AddItemCard from './AddItemCard.vue';
import ItemsContainer from './ItemsContainer.vue';
import ModalAddDeveloper from './ModalAddDeveloper.vue';
import { isUrlValid } from 'src/components/common/Validators';

const ADD_IMG = '~assets/img/add.png';

export default defineComponent({
  components: {
    ImageCard,
    AddItemCard,
    ItemsContainer,
    ModalAddDeveloper,
  },
  setup() {
    const initDeveloper = () => ({
      name: '',
      iconFile: '',
      linkedInAccountUrl: '',
      twitterAccountUrl: '',
    });

    const store = useStore();
    const theme = computed<string>(() => store.getters['general/theme']);
    const isDark = ref<boolean>(theme.value.toLowerCase() === 'dark');
    const data = reactive<NewDappItem>({ tags: [] } as unknown as NewDappItem);
    const isModalAddDeveloper = ref<boolean>(false);
    let currentDeveloper = reactive<Developer>(initDeveloper());

    // make a placeholder for add logo
    data.icon = new File([], 'Add a logo image'); // TODO translate
    data.iconFile = '';

    data.images = [];
    data.images.push(new File([], 'Add an image')); // Add image placeholder
    data.imagesContent = [];
    data.imagesContent.push('');

    const isValidAddress = (address: string): boolean => isEthereumAddress(address); // || isValidAddressPolkadotAddress(address);
    // TODO uncoment the code above when we will support ink contract.

    const updateDappImages = (): void => {
      data.imagesContent = [];
      data.imagesContent.push('');

      data.images.forEach((image, index) => {
        if (index > 0) {
          const reader = new FileReader();
          reader.readAsDataURL(image);
          reader.onload = () => {
            data.imagesContent.push(reader.result?.toString() || '');
          };
          reader.onerror = (error) => console.error(error);
        }
      });
    };

    const updateDappLogo = (): void => {
      const reader = new FileReader();
      reader.readAsDataURL(data.icon);
      reader.onload = () => {
        data.iconFile = reader.result?.toString() || '';
      };
      reader.onerror = (error) => console.error(error);
    };

    const removeFile = (index: number): void => {
      data.images.splice(index, 1);
      data.imagesContent.splice(index, 1);
    };

    const addDeveloper = () => {
      currentDeveloper = initDeveloper();
      isModalAddDeveloper.value = true;
    };

    const handleModalAddDeveloper = ({ isOpen }: { isOpen: boolean }) => {
      isModalAddDeveloper.value = isOpen;
    };

    watch([theme], (val) => {
      isDark.value = val[0].toLowerCase() === 'dark';
    });

    return {
      data,
      isDark,
      isModalAddDeveloper,
      currentDeveloper,
      isValidAddress,
      updateDappImages,
      updateDappLogo,
      removeFile,
      isUrlValid,
      addDeveloper,
      handleModalAddDeveloper,
    };
  },
});
</script>

<style scoped lang="scss">
@use 'src/components/assets/styles/assets.scss';
.input {
  font-weight: 'bold';
  color: '#fff';
}

.component {
  margin-bottom: 20px;
}

.q-field__messages {
  font-size: 20px !important;
}

.card {
  margin-top: 8px;
  margin-right: 12px;
}
</style>

<style lang="sass">
.q-field
  &--standout
    &.q-field--dark
      .q-field__control
        background: $gray-5-selected
        &:before
          background: $gray-5-selected
      &.q-field--highlighted
        .q-field__control
          background: $gray-5-selected-dark
        .q-field__native
          color: $gray-1
      .q-field__control
        background: $gray-5-selected-dark
    .q-field__control
      background: $gray-3
      &:before
        background: $gray-3
    &.q-field--highlighted
      .q-field__control
        background: $gray-2
      .q-field__native
        color: $gray-6
    .q-field__control
      background: $gray-2
  &--highlighted
    .q-field__label
      color: rgba(0, 0, 0, 0.6)
</style>
