<template>
  <astar-default-modal
    :show="show"
    :title="$t('dappStaking.modals.builder.title')"
    :width="544"
    @close="closeModal"
  >
    <div class="developers-wrapper">
      <q-form ref="developerForm">
        <q-input
          v-model="currentDeveloper.githubAccountUrl"
          :label="$t('dappStaking.modals.builder.githubAccount')"
          outlined
          label-color="input-label"
          input-class="input"
          :input-style="{ fontWeight: 'bold' }"
          lazy-rules="ondemand"
          :rules="[
            (v: string) => validateUrlFormat(v) || `${$t('dappStaking.modals.builder.error.invalidUrl')}`,
            // (v: string) => validateAtLeastOneUrl(v) || `${$t('dappStaking.modals.builder.error.accountRequired')}`
          ]"
          class="component"
        />

        <q-input
          v-model="currentDeveloper.twitterAccountUrl"
          :label="$t('dappStaking.modals.builder.twitterAccount')"
          outlined
          label-color="input-label"
          input-class="input"
          :input-style="{ fontWeight: 'bold' }"
          lazy-rules="ondemand"
          :rules="[
            (v: string) => validateUrlFormat(v) || `${$t('dappStaking.modals.builder.error.invalidUrl')}`,
            // (v: string) => validateAtLeastOneUrl(v) || `${$t('dappStaking.modals.builder.error.accountRequired')}`
          ]"
          class="component"
        />

        <q-input
          v-model="currentDeveloper.linkedInAccountUrl"
          :label="$t('dappStaking.modals.builder.linkedInAccount')"
          outlined
          label-color="input-label"
          input-class="input"
          :input-style="{ fontWeight: 'bold' }"
          lazy-rules="ondemand"
          :rules="[
            (v: string) => validateUrlFormat(v) || `${$t('dappStaking.modals.builder.error.invalidUrl')}`,
            // (v: string) => validateAtLeastOneUrl(v) || `${$t('dappStaking.modals.builder.error.accountRequired')}`
          ]"
          class="component"
        />

        <q-file
          v-model="file"
          outlined
          max-file-size="1000000"
          accept=".jpg .png, image/*"
          :label="$t('dappStaking.modals.builder.image')"
          class="component"
          lazy-rules="ondemand"
          :rules="[(v: File) => v.size > 0 || `${$t('dappStaking.modals.builder.error.builderImageRequired')}`]"
          @update:model-value="updateImage()"
        >
          <template #file>
            <image-card v-show="currentDeveloper.iconFile" class="card">
              <avatar :url="currentDeveloper.iconFile" class="avatar" />
            </image-card>
          </template>
        </q-file>

        <q-input
          v-model="currentDeveloper.name"
          label="Name"
          outlined
          label-color="input-label"
          input-class="input"
          :input-style="{ fontWeight: 'bold' }"
          lazy-rules="ondemand"
          :rules="[(v: string) => (v && v.length > 0) || `${$t('dappStaking.modals.builder.error.name')}`]"
          class="component"
        />

        <div class="validation-warning">
          <li>{{ $t('dappStaking.modals.builder.error.buildersRequired') }}</li>
          <li>{{ $t('dappStaking.modals.builder.imageRecomendation') }}</li>
        </div>

        <Button :width="464" :height="52" @click="handleConfirm">
          {{ $t('confirm') }}
        </Button>
      </q-form>
    </div>
  </astar-default-modal>
</template>

<script lang="ts">
import { wait } from 'src/hooks/helper/common';
import { defineComponent, ref, toRefs, PropType, computed, watch } from 'vue';
import { fadeDuration, Button } from '@astar-network/astar-ui';
import { Developer } from 'src/store/dapp-staking/state';
import { isUrlValid } from 'src/components/common/Validators';
import ImageCard from 'src/components/dapp-staking/register/ImageCard.vue';
import Avatar from 'src/components/common/Avatar.vue';

export default defineComponent({
  components: {
    ImageCard,
    Avatar,
    Button,
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    handleModalDeveloper: {
      type: Function,
      required: true,
    },
    developer: {
      type: Object as PropType<Developer>,
      required: true,
    },
    addDeveloper: {
      type: Function,
      required: true,
    },
    updateDeveloper: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const initFile = (): File => new File(props.developer.iconFile ? [new Uint8Array(1)] : [], '');

    // This value is bound to template.
    let currentDeveloper = ref<Developer>(props.developer);

    const isClosingModal = ref<boolean>(false);
    const isNewDeveloper = ref<boolean>(true);
    const file = ref<File>(initFile());
    const developerForm = ref();

    const closeModal = async (): Promise<void> => {
      isClosingModal.value = true;

      await wait(fadeDuration);
      props.handleModalDeveloper({ isOpen: false });
      isClosingModal.value = false;
    };

    const validateUrlFormat = (url: string): boolean => (url !== '' ? isUrlValid(url) : true);

    // const validateAtLeastOneUrl = (url: string): boolean =>
    //   url !== '' ||
    //   currentDeveloper.value.linkedInAccountUrl !== '' ||
    //   currentDeveloper.value.twitterAccountUrl !== '';

    const updateImage = (): void => {
      const reader = new FileReader();
      reader.readAsDataURL(file.value);
      reader.onload = () => {
        currentDeveloper.value.iconFile = reader.result?.toString() || '';
      };
      reader.onerror = (error) => console.error(error);
    };

    const handleConfirm = (): void => {
      developerForm?.value?.validate().then(async (success: boolean) => {
        if (success) {
          if (isNewDeveloper.value) {
            props.addDeveloper(currentDeveloper.value);
          } else {
            props.updateDeveloper(currentDeveloper.value);
          }
        }
      });
    };

    watch([props], () => {
      // When dialog is shown, assign currentDeveloper.
      if (props.show) {
        currentDeveloper.value = { ...props.developer };
        isNewDeveloper.value = !props.developer.name;

        if (isNewDeveloper.value) {
          file.value = initFile();
        }
      }
    });

    return {
      ...toRefs(props),
      isClosingModal,
      currentDeveloper,
      file,
      developerForm,
      closeModal,
      isUrlValid,
      validateUrlFormat,
      // validateAtLeastOneUrl,
      updateImage,
      handleConfirm,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/assets.scss';
@use 'src/components/dapp-staking/styles/register.scss';

.component {
  margin-bottom: 4px;
}

.card {
  margin-top: 8px;
}

.avatar {
  text-align: center;
  width: 80px;
  height: 80px;
}

.developers-wrapper {
  margin-top: 20px;
}
</style>
