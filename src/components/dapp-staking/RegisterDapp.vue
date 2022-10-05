<template>
  <div class="container--register">
    <q-form ref="dappForm">
      <div style="display: flex; flex-direction: column">
        <q-input
          v-model="data.name"
          :label="$t('dappStaking.modals.name')"
          outlined
          label-color="input-label"
          input-class="input"
          :input-style="{ fontWeight: 'bold' }"
          lazy-rules="ondemand"
          :rules="[(v: string) => (v && v.length > 0) || `${$t('dappStaking.modals.dappNameRequired')}`]"
          class="component"
        />
        <q-file
          v-model="data.icon"
          outlined
          :label="$t('dappStaking.modals.projectLogo')"
          accept=".jpg .png, image/*"
          class="component"
          input-style="{ height: '120px'}"
          lazy-rules="ondemand"
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
          outlined
          readonly
          label-color="input-label"
          input-class="input"
          :input-style="{ fontWeight: 'bold' }"
          class="address"
        />

        <q-input
          v-model="data.url"
          :label="$t('dappStaking.modals.projectUrl')"
          outlined
          label-color="input-label"
          input-class="input"
          :input-style="{ fontWeight: 'bold' }"
          lazy-rules="ondemand"
          :rules="[
            (v: string) => v !== '' || `${$t('dappStaking.modals.projectUrlRequired')}`,
            (v: string) => isUrlValid(v) || `${$t('dappStaking.modals.builder.error.invalidUrl')}`,
          ]"
          class="component"
        />

        <dapp-images :dapp="data" class="component" @dapp-changed="handleDappChanged" />
        <builders :dapp="data" :validation-error="errors.builders" />
        <description :dapp="data" class="custom-component" />
        <community :dapp="data" :validation-error="errors.community" class="custom-component" />
        <platforms :dapp="data" :validation-error="errors.platform" class="custom-component" />
        <contract-types :dapp="data" class="custom-component" />
        <main-category :dapp="data" class="custom-component" />
        <!-- <tags
        :dapp="data"
        :category="(currentCategory.value as Category)"
        :category-name="currentCategory.label"
        class="component"
      /> -->
        <license :dapp="data" class="component" />
        <div class="button--container">
          <Button :width="328" :height="52" @click="handleSubmit">
            {{ $t('dappStaking.modals.submit') }}
          </Button>
        </div>
      </div>
    </q-form>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { Button } from '@astar-network/astar-ui';
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
import MainCategory from 'src/components/dapp-staking/register/MainCategory.vue';
import License from 'src/components/dapp-staking/register/License.vue';
import { possibleLicenses } from 'src/components/dapp-staking/register/License.vue';
import { possibleCategories } from './register/MainCategory.vue';
import { isUrlValid } from 'src/components/common/Validators';
import { sanitizeData } from 'src/hooks/helper/markdown';
import { LabelValuePair } from 'src/components/dapp-staking/register/ItemsToggle.vue';

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
    MainCategory,
    License,
    Button,
  },
  setup() {
    const initDeveloper = (): Developer => ({
      name: '',
      iconFile: '',
      linkedInAccountUrl: '',
      twitterAccountUrl: '',
    });

    const { t } = useI18n();
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
    data.address = '0x00000....';

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
      errors.value.builders =
        data.developers.length > 1 ? '' : t('dappStaking.modals.builder.error.developersRequired');
      errors.value.community =
        data.communities.length > 0 ? '' : t('dappStaking.modals.community.communityRequired');
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
@use 'src/components/dapp-staking/styles/register.scss';

.input {
  font-weight: 'bold';
  color: '#fff';
}

.component {
  margin-bottom: 10px;
}

.custom-component {
  margin-bottom: 20px;
}

.address {
  margin-bottom: 30px;
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

<style lang="scss">
.q-field--outlined:hover .q-field__control:before {
  border-color: $astar-blue;
}

.q-field--outlined .q-field__control:before {
  border-color: $gray-2;
}

.q-field--outlined .q-field__control {
  border-radius: 6px;
}

// editing
.q-field--outlined .q-field__control:after {
  border-width: 1px;
}

// error
.q-field--outlined.q-field--highlighted .q-field__control:after {
  border-width: 1px;
}

.q-field__control {
  color: $gray-3;
  border-color: $gray-2;
}

.q-field--outlined:hover.q-field--dark .q-field__control:before {
  border-color: $astar-blue;
}

.q-field--outlined.q-field--dark .q-field__control:before {
  border-color: $gray-5;
}

// readonly
.q-field--outlined.q-field--readonly .q-field__control:before {
  border-style: solid;
  border-color: $gray-1;
  background-color: $gray-1;
}

.q-field--outlined.q-field--dark.q-field--readonly .q-field__control:before {
  border-color: $gray-5;
}

.q-field--outlined:hover.q-field--readonly .q-field__control:before {
  border-color: $gray-1;
}

.q-field--outlined.q-field--dark.q-field--readonly .q-field__control:before {
  border-style: solid;
  background-color: $gray-5;
}

.q-field--outlined:hover.q-field--dark.q-field--readonly .q-field__control:before {
  border-color: $gray-5;
}

// label
.q-field--float .q-field__label {
  font-size: 18px;
}

// hide validation error icon
.q-field__append.q-field__marginal.row.no-wrap.items-center.q-anchor--skip {
  display: none;
}
</style>

