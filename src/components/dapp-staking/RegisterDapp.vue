<template>
  <div class="container--register">
    <back-to-page :text="$t('dappStaking.stakePage.backToDappList')" :link="Path.DappStaking" />
    <welcome-banner v-if="isNewDapp" class="welcome" />
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
        <contract-types :dapp="data" class="custom-component" />
        <main-category :dapp="data" class="custom-component" />
        <tags :dapp="data" class="component" />
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
import { $api } from 'boot/api';
import { Button } from '@astar-network/astar-ui';
import { Category, Developer, FileInfo, NewDappItem } from 'src/store/dapp-staking/state';
import ImageCard from 'src/components/dapp-staking/register/ImageCard.vue';
import AddItemCard from 'src/components/dapp-staking/register/AddItemCard.vue';
import Builders from 'src/components/dapp-staking/register/Builders.vue';
import Community from 'src/components/dapp-staking/register/Community.vue';
import DappImages from 'src/components/dapp-staking/register/DappImages.vue';
import Description from 'src/components/dapp-staking/register/Description.vue';
import WelcomeBanner from 'src/components/dapp-staking/register/WelcomeBanner.vue';
import ContractTypes, {
  possibleContractTypes,
} from 'src/components/dapp-staking/register/ContractTypes.vue';
import MainCategory, {
  possibleCategories,
} from 'src/components/dapp-staking/register/MainCategory.vue';
import License from 'src/components/dapp-staking/register/License.vue';
import Tags from 'src/components/dapp-staking/register/Tags.vue';
import { possibleLicenses } from 'src/components/dapp-staking/register/License.vue';
import { isUrlValid } from 'src/components/common/Validators';
import { sanitizeData } from 'src/hooks/helper/markdown';
import { LabelValuePair } from 'src/components/dapp-staking/register/ItemsToggle.vue';
import { container } from 'src/v2/common';
import { IDappStakingService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { useStore } from 'src/store';
import { useCustomSignature, useGasPrice, useNetworkInfo, useSignPayload } from 'src/hooks';
import { useExtrinsicCall } from 'src/hooks/custom-signature/useExtrinsicCall';
import { RegisterParameters } from 'src/store/dapp-staking/actions';
import { Path } from 'src/router';
import BackToPage from 'src/components/common/BackToPage.vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  components: {
    ImageCard,
    AddItemCard,
    Builders,
    Community,
    DappImages,
    Description,
    ContractTypes,
    MainCategory,
    License,
    Button,
    Tags,
    BackToPage,
    WelcomeBanner,
  },
  setup() {
    const initDeveloper = (): Developer => ({
      name: '',
      iconFile: '',
      githubAccountUrl: '',
      linkedInAccountUrl: '',
      twitterAccountUrl: '',
    });

    const { t } = useI18n();
    const { signPayload } = useSignPayload();
    const { selectedTip } = useGasPrice();
    const { isCustomSig } = useCustomSignature({});
    const { getCallFunc } = useExtrinsicCall({ onResult: () => {}, onTransactionError: () => {} });
    const { currentNetworkName } = useNetworkInfo();
    const store = useStore();
    const currentAddress = computed(() => store.getters['general/selectedAddress']);
    const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);
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
    const router = useRouter();
    const isNewDapp = ref<boolean>(false);

    // make a placeholder for add logo
    data.icon = new File([], t('dappStaking.modals.addLogo'));
    data.developers = [];
    data.communities = [];
    data.tags = [];
    data.mainCategory = currentCategory.value.value as Category;
    data.license = possibleLicenses[0].value;
    data.iconFile = '';

    data.images = [];
    data.images.push(new File([], t('dappStaking.modals.addImage'))); // Add image placeholder
    data.imagesContent = [];
    data.imagesContent.push('');

    const isValidAddress = (address: string): boolean => isEthereumAddress(address); // || isValidAddressPolkadotAddress(address);
    // TODO uncoment the code above when we will support ink contract.

    const updateDappLogo = (): void => {
      const reader = new FileReader();
      reader.readAsDataURL(data.icon);
      reader.onload = () => {
        data.iconFile = reader.result?.toString() || '';
        data.iconFileName = data.icon.name;
      };
      reader.onerror = (error) => console.error(error);
    };

    const handleDappChanged = (newData: NewDappItem): void => {
      newData.descriptionMarkdown = newData.description ? sanitizeData(newData.description) : '';

      currentCategory.value =
        possibleCategories.find((x: LabelValuePair) => x.value === data.mainCategory) ??
        possibleCategories[0];
      data.ref = newData;
    };

    const validateCustomComponents = (): boolean => {
      errors.value.builders =
        data.developers.length > 1 ? '' : t('dappStaking.modals.builder.error.buildersRequired');
      errors.value.community =
        data.communities.length > 0 ? '' : t('dappStaking.modals.community.communityRequired');

      for (const [key, value] of Object.entries(errors.value)) {
        if (value) {
          return false;
        }
      }

      return true;
    };

    const getImageUrl = (fileInfo: FileInfo): string =>
      fileInfo
        ? `data:${fileInfo.contentType};base64,${fileInfo.base64content}`
        : '/images/noimage.png';

    const getImageName = (apiImageName: string): string =>
      apiImageName ? apiImageName.replace(`${data.address}_`, '') : '';

    const getDapp = async (): Promise<void> => {
      try {
        store.commit('general/setLoading', true);
        const service = container.get<IDappStakingService>(Symbols.DappStakingService);
        const developerContract =
          currentAddress.value && (await service.getRegisteredContract(currentAddress.value));
        data.address = developerContract ?? '';
        if (data.address && currentNetworkName.value) {
          const registeredDapp = await service.getDapp(data.address, currentNetworkName.value);
          isNewDapp.value = !registeredDapp;
          if (registeredDapp && !registeredDapp.tags) {
            registeredDapp.tags = [];
          }

          if (registeredDapp) {
            data.address = registeredDapp.address;
            data.name = registeredDapp.name;
            data.url = registeredDapp.url;
            data.iconFile = getImageUrl(registeredDapp.iconFile);
            data.iconFileName = getImageName(registeredDapp.iconFile?.name);
            // Let quasar file component info that icon is set so it doesn't raise validation error.
            data.icon = new File([new Uint8Array(1)], data.iconFileName);
            registeredDapp.images.forEach((x) => {
              data.images.push(
                new File([Buffer.from(x.base64content, 'base64')], getImageName(x?.name), {
                  type: x.contentType,
                })
              );
              data.imagesContent.push(getImageUrl(x));
            });
            data.developers = registeredDapp.developers
              ? registeredDapp.developers.map((x) => ({
                  name: x.name,
                  githubAccountUrl: x.githubAccountUrl,
                  twitterAccountUrl: x.twitterAccountUrl,
                  linkedInAccountUrl: x.linkedInAccountUrl,
                  iconFile: x.iconFile?.split('&#x2F;').join('/'),
                }))
              : [];
            data.description = registeredDapp.description;
            data.communities = registeredDapp.communities ?? [];
            data.contractType = registeredDapp.contractType ?? possibleContractTypes[2].value; // default to evm
            data.mainCategory =
              registeredDapp.mainCategory ?? (currentCategory.value.value as Category);
            data.license = registeredDapp.license;
            data.tags = registeredDapp.tags;
          }
        } else {
          router.push(Path.DappStaking);
        }
      } catch (e) {
        // TODO pop error message.
        console.error((e as Error).message);
      } finally {
        store.commit('general/setLoading', false);
      }
    };

    const handleSubmit = (): void => {
      dappForm?.value?.validate().then(async (success: boolean) => {
        if (success && validateCustomComponents()) {
          const senderAddress = store.getters['general/selectedAddress'];
          const currentNetwork = computed(() => {
            const chainInfo = store.getters['general/chainInfo'];
            const chain = chainInfo ? chainInfo.chain : '';
            return chain.toString().split(' ')[0];
          });

          const signature = await signPayload(senderAddress, data.address);
          const result = await store.dispatch('dapps/registerDappApi', {
            dapp: data,
            api: $api,
            senderAddress,
            substrateAccounts: substrateAccounts.value,
            tip: selectedTip.value.price,
            network: currentNetwork.value,
            isCustomSignature: isCustomSig.value,
            getCallFunc,
            signature,
          } as RegisterParameters);

          if (result) {
            router.push(Path.DappStaking);
          }
        }
      });
    };

    watch(
      [currentAddress],
      () => {
        if (currentAddress) {
          getDapp();
        }
      },
      { immediate: true }
    );

    return {
      data,
      isModalAddDeveloper,
      currentDeveloper,
      possibleCategories,
      currentCategory,
      dappForm,
      errors,
      Path,
      isNewDapp,
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

.q-field--outlined.q-field--dark .q-field__control {
  background-color: $body-bg-dark;
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

.button--container {
  margin-bottom: 20px;
}

.welcome {
  margin-bottom: 30px;
}
</style>
