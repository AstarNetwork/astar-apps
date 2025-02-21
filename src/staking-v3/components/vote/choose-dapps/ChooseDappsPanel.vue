<template>
  <div class="main-container">
    <dapp-search :title="title" :search-term="searchTerm" :on-search="handleSearch" />
    <choose-category
      v-show="currentView === View.Category"
      :on-category-selected="handleCategorySelected"
    />
    <dapps-list
      v-show="currentView === View.Dapps"
      :dapps="dapps"
      :category="currentCategory"
      :filter="searchTerm"
      :on-dapps-selected="handleDappsSelected"
    />
    <error-panel :error-message="errorMessage" class="error-label" />
    <div v-if="currentView === View.Dapps" class="buttons">
      <go-back-button @click="goBackToCategories">{{
        $t('stakingV3.voting.backToCategory')
      }}</go-back-button>
      <astar-button :disabled="!canSubmit" class="submit-button" @click="submit()">{{
        $t('stakingV3.done')
      }}</astar-button>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed, ref, type PropType } from 'vue';
import DappsList from './DappsList.vue';
import ChooseCategory from './ChooseCategory.vue';
import DappSearch from './DappSearch.vue';
import GoBackButton from '../GoBackButton.vue';
import ErrorPanel from '../../ErrorPanel.vue';
import { type DappVote, mapToDappVote } from '../../../logic';
import { useDapps } from 'src/staking-v3/hooks';
import { useI18n } from 'vue-i18n';

enum View {
  Category = 0,
  Dapps = 1,
}

export default defineComponent({
  components: { DappsList, ChooseCategory, DappSearch, GoBackButton, ErrorPanel },
  props: {
    onDappsSelected: {
      type: Function as PropType<(dapps: DappVote[]) => void>,
      required: true,
    },
    onDappsSelectionChanged: {
      type: Function as PropType<(before: DappVote[], after: DappVote[]) => void>,
      required: false,
      default: undefined,
    },
    scrollToTop: {
      type: Function as PropType<() => void>,
      required: true,
    },
    moveFromAddress: {
      type: String,
      required: false,
      default: undefined,
    },
    errorMessage: {
      type: String,
      required: false,
      default: '',
    },
  },
  setup(props) {
    const { registeredDapps } = useDapps();
    const { t } = useI18n();
    const currentCategory = ref<string>();
    const currentView = ref<View>(View.Category);
    const selectedDapps = ref<DappVote[]>([]);
    const searchTerm = ref<string>('');

    const title = computed<string>(() =>
      currentView.value === View.Dapps
        ? t('stakingV3.voting.chooseProjects')
        : t('stakingV3.voting.chooseCategory')
    );

    const dapps = computed<DappVote[]>(() =>
      registeredDapps.value.map((dapp) => mapToDappVote(dapp))
      .filter(dapp => dapp.address.toLowerCase() !== props.moveFromAddress?.toLowerCase())
    );

    const handleCategorySelected = (category: string): void => {
      props.scrollToTop();
      currentCategory.value = category;
      currentView.value = View.Dapps;

      if (category) {
        searchTerm.value = '';
      }
    };

    const handleDappsSelected = (dapps: DappVote[]): void => {
      props.onDappsSelectionChanged?.(selectedDapps.value, dapps);
      selectedDapps.value = dapps;
    };

    const handleSearch = (search: string): void => {
      searchTerm.value = search;
      if (searchTerm.value.length > 0) {
        currentView.value = View.Dapps;
      }
    };

    const canSubmit = computed<boolean>(() => selectedDapps.value.length > 0);

    const submit = (): void => {
      if (canSubmit.value && props.onDappsSelected) {
        props.onDappsSelected(selectedDapps.value);
      }
    };

    const goBackToCategories = (): void => {
      currentView.value = View.Category;
      currentCategory.value = undefined;
      props.scrollToTop();
    };

    return {
      View,
      dapps,
      currentView,
      currentCategory,
      canSubmit,
      searchTerm,
      title,
      handleCategorySelected,
      goBackToCategories,
      handleDappsSelected,
      submit,
      handleSearch,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/staking-v3/components/vote/styles/vote-common.scss';

.main-container {
  overflow: hidden;
}

.buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;

  button {
    height: 40px;
    width: calc(50% - 4px);

    @media (min-width: $lg) {
      width: auto;
      min-width: 160px;
    }
  }
}

.error-label {
  margin-top: 24px;
}
</style>
