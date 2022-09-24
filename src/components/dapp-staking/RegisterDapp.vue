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
          :rules="[(v: string) => (v && v.length > 0) || 'dApp name is required.']"
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
          :rules="[(v: string) => isValidAddress(v) || 'Enter a valid EVM or SS58 contract address.']"
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
            (v: string) => v !== '' || 'Enter project url.',
            (v: string) => isUrlValid(v) || 'Invalid project url.',
          ]"
          class="component"
        />

        <dapp-images :dapp="data" class="component" @dapp-changed="handleDappChanged" />
        <builders :dapp="data" class="component" />
        <description :dapp="data" class="component" />
        <community :dapp="data" class="component" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref, watch } from 'vue';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { useStore } from 'src/store';
import { Developer, NewDappItem } from 'src/store/dapp-staking/state';
import ImageCard from 'src/components/dapp-staking/register/ImageCard.vue';
import AddItemCard from 'src/components/dapp-staking/register/AddItemCard.vue';
import Builders from 'src/components/dapp-staking/register/Builders.vue';
import Community from 'src/components/dapp-staking/register/Community.vue';
import DappImages from 'src/components/dapp-staking/register/DappImages.vue';
import Description from 'src/components/dapp-staking/register/Description.vue';
import { isUrlValid } from 'src/components/common/Validators';
import { sanitizeData } from 'src/hooks/helper/markdown';

const ADD_IMG = '~assets/img/add.png';

export default defineComponent({
  components: {
    ImageCard,
    AddItemCard,
    Builders,
    Community,
    DappImages,
    Description,
  },
  setup() {
    const initDeveloper = (): Developer => ({
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
    const currentDeveloper = ref<Developer>(initDeveloper());

    // make a placeholder for add logo
    data.icon = new File([], 'Add a logo image'); // TODO translate
    data.developers = [];
    data.communities = [];
    data.iconFile = '';

    data.images = [];
    data.images.push(new File([], 'Add an image')); // Add image placeholder
    data.imagesContent = [];
    data.imagesContent.push('');

    const isValidAddress = (address: string): boolean => isEthereumAddress(address); // || isValidAddressPolkadotAddress(address);
    // TODO uncoment the code above when we will support ink contract.

    const updateDappLogo = (): void => {
      const reader = new FileReader();
      reader.readAsDataURL(data.icon);
      reader.onload = () => {
        data.iconFile = reader.result?.toString() || '';
      };
      reader.onerror = (error) => console.error(error);
    };

    const handleDappChanged = (newData: NewDappItem): void => {
      if (newData.description) {
        newData.descriptionMarkdown = sanitizeData(newData.description);
      }

      data.ref = newData;
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
      updateDappLogo,
      isUrlValid,
      handleDappChanged,
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

.card {
  margin-top: 8px;
  margin-right: 12px;
}

.wrapper--description {
  position: relative;
  display: flex;
  justify-content: center;
}

.container--description {
  display: grid;
  row-gap: 32px;
  margin-bottom: 24px;
  @media (min-width: $xl) {
    justify-content: center;
  }
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
        background: $gray-1
      .q-field__native
        color: $gray-6
    .q-field__control
      background: $gray-1
  &--highlighted
    .q-field__label
      color: rgba(0, 0, 0, 0.6)
</style>
