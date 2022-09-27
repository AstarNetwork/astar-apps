<template>
  <q-form ref="dappForm">
    <div style="display: flex; flex-direction: column">
      <q-input
        v-model="data.name"
        :label="$t('dappStaking.modals.name')"
        standout="text-white"
        label-color="input-label"
        input-class="input"
        :input-style="{ fontWeight: 'bold' }"
        :rules="[(v: string) => (v && v.length > 0) || `${$t('dappStaking.modals.dappNameRequired')}`]"
        class="component"
      />
      <q-file
        v-model="data.icon"
        standout="text-white"
        counter
        :label="$t('dappStaking.modals.projectLogo')"
        accept=".jpg .png, image/*"
        class="component"
        input-style="{ height: '120px'}"
        :rules="[(v: File) => v.size > 0 || `${$t('dappStaking.modals.dappImageRequired')}`]"
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
        :label="$t('dappStaking.modals.contractAddress')"
        standout="text-white"
        label-color="input-label"
        input-class="input"
        :input-style="{ fontWeight: 'bold' }"
        :rules="[(v: string) => isValidAddress(v) || `${$t('dappStaking.modals.invalidAddress')}`]"
        class="component"
      />

      <q-input
        v-model="data.url"
        :label="$t('dappStaking.modals.projectUrl')"
        standout="text-white"
        label-color="input-label"
        input-class="input"
        :input-style="{ fontWeight: 'bold' }"
        :rules="[
            (v: string) => v !== '' || `${$t('dappStaking.modals.projectUrlRequired')}`,
            (v: string) => isUrlValid(v) || `${$t('dappStaking.modals.builder.error.invalidUrl')}`,
          ]"
        class="component"
      />

      <dapp-images :dapp="data" class="component" @dapp-changed="handleDappChanged" />
      <builders :dapp="data" :validation-error="errors.builders" class="component" />
      <description :dapp="data" class="component" />
      <community :dapp="data" :validation-error="errors.community" class="component" />
      <platforms :dapp="data" :validation-error="errors.platform" class="component" />
      <contract-types :dapp="data" class="component" />
      <main-category :dapp="data" class="component" />
      <tags
        :dapp="data"
        :category="(currentCategory.value as Category)"
        :category-name="currentCategory.label"
        class="component"
      />
      <license :dapp="data" class="component" />
      <button class="btn btn--confirm btn-size-adjust submit" @click="handleSubmit">
        {{ $t('dappStaking.modals.submit') }}
      </button>
    </div>
  </q-form>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref, watch } from 'vue';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { useStore } from 'src/store';
import { Category, Developer, NewDappItem } from 'src/store/dapp-staking/state';
import ImageCard from 'src/components/dapp-staking/register/ImageCard.vue';
import AddItemCard from 'src/components/dapp-staking/register/AddItemCard.vue';
import Builders from 'src/components/dapp-staking/register/Builders.vue';
import Community from 'src/components/dapp-staking/register/Community.vue';
import DappImages from 'src/components/dapp-staking/register/DappImages.vue';
import Description from 'src/components/dapp-staking/register/Description.vue';
import Platforms from 'src/components/dapp-staking/register/Platforms.vue';
import ContractTypes from 'src/components/dapp-staking/register/ContractTypes.vue';
import Tags from 'src/components/dapp-staking/register/Tags.vue';
import MainCategory from 'src/components/dapp-staking/register/MainCategory.vue';
import License from 'src/components/dapp-staking/register/License.vue';
import { possibleLicenses } from 'src/components/dapp-staking/register/License.vue';
import { possibleCategories } from './register/MainCategory.vue';
import { isUrlValid } from 'src/components/common/Validators';
import { sanitizeData } from 'src/hooks/helper/markdown';
import { LabelValuePair } from 'src/components/dapp-staking/register/ItemsToggle.vue';

const ADD_IMG = '~assets/img/add.png';

export default defineComponent({
  components: {
    ImageCard,
    AddItemCard,
    Builders,
    Community,
    DappImages,
    Description,
    Platforms,
    ContractTypes,
    Tags,
    MainCategory,
    License,
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
    const currentCategory = ref<LabelValuePair>(possibleCategories[0]);
    const dappForm = ref();
    const errors = ref({
      builders: '',
      community: '',
      platform: '',
    });

    // make a placeholder for add logo
    data.icon = new File([], 'Add a logo image'); // TODO translate
    data.developers = [];
    data.communities = [];
    data.platforms = [];
    data.tags = [];
    data.mainCategory = currentCategory.value.value as Category;
    data.license = possibleLicenses[0].value;
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
      newData.descriptionMarkdown = newData.description ? sanitizeData(newData.description) : '';

      currentCategory.value =
        possibleCategories.find((x: LabelValuePair) => x.value === data.mainCategory) ??
        possibleCategories[0];
      data.ref = newData;
      console.log(newData.ref);
    };

    const validateCustomComponents = (): boolean => {
      errors.value.builders = data.developers.length > 0 ? '' : 'Builders missing';
      errors.value.community = data.communities.length > 0 ? '' : 'Communitit missing';
      errors.value.platform = data.platforms.length > 0 ? '' : 'Platform missing';
      console.log(errors.value);

      for (const [key, value] of Object.entries(errors.value)) {
        if (value) {
          return false;
        }
      }

      return true;
    };

    const handleSubmit = (): void => {
      dappForm?.value?.validate().then(async (success: boolean) => {
        if (success && validateCustomComponents()) {
          alert('Submitted');
        }
      });
    };

    watch([theme], (val) => {
      isDark.value = val[0].toLowerCase() === 'dark';
    });

    return {
      data,
      isDark,
      isModalAddDeveloper,
      currentDeveloper,
      possibleCategories,
      currentCategory,
      dappForm,
      errors,
      isValidAddress,
      updateDappLogo,
      isUrlValid,
      handleDappChanged,
      handleSubmit,
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

.submit {
  align-self: center;
  margin-top: 20px;
}
</style>

<!-- Override quasar colors -->
<style lang="sass">
.q-field
  &--standout
    &.q-field--dark
      .q-field__control
        background: $gray-5-selected-dark
        &:before
          background: $gray-5-selected-dark
      &.q-field--highlighted
        .q-field__control
          background: $gray-5-selected-dark
        .q-field__native
          color: $gray-1
      .q-field__control
        background: $gray-5-selected-dark
    .q-field__control
      background: $gray-1
      &:before
        background: $gray-1
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
  &__label
    color: $gray-4
  &--highlighted
    .q-field__label
      color: $gray-4
  &--dark
    &__label
      color: $gray-3
    &--highlighted
      .q-field__label
        color: $gray-3
</style>
