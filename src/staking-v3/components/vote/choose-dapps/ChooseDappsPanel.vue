<template>
  <div>
    <choose-category
      v-if="currentView === View.Category"
      :on-category-selected="handleCategorySelected"
    />
    <dapps-list
      v-if="currentView === View.Dapps"
      :dapps="dapps"
      :category="currentCategory"
      :on-dapps-selected="handleDappsSelected"
    />
    <div v-if="currentView === View.Dapps" class="buttons">
      <button @click="goBackToCategories()">{{ $t('stakingV3.voting.backToCategory') }}</button>
      <button :disabled="!canSubmit" @click="submit()">{{ $t('stakingV3.done') }}</button>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed, ref, PropType } from 'vue';
import DappsList from './DappsList.vue';
import ChooseCategory from './ChooseCategory.vue';
import { Dapp } from './Model';
import { useDapps } from 'src/staking-v3/hooks';

enum View {
  Category,
  Dapps,
}

export default defineComponent({
  components: { DappsList, ChooseCategory },
  props: {
    onDappsSelected: {
      type: Function as PropType<(dapps: Dapp[]) => void>,
      required: true,
    },
  },
  setup(props) {
    const { registeredDapps } = useDapps();
    const currentCategory = ref<string>();
    const currentView = ref<View>(View.Category);
    const selectedDapps = ref<Dapp[]>([]);

    const dapps = computed<Dapp[]>(() =>
      registeredDapps.value.map((dapp) => ({
        name: dapp.basic.name,
        address: dapp.chain.address,
        logoUrl: dapp.basic.iconUrl,
        amount: 0,
        id: dapp.chain.id,
        mainCategory: dapp.basic.mainCategory,
      }))
    );

    const handleCategorySelected = (category: string): void => {
      currentCategory.value = category;
      currentView.value = View.Dapps;
    };

    const handleDappsSelected = (dapps: Dapp[]): void => {
      selectedDapps.value = dapps;
    };

    const canSubmit = computed<boolean>(() => selectedDapps.value.length > 0);

    const submit = (): void => {
      if (canSubmit.value && props.onDappsSelected) {
        props.onDappsSelected(selectedDapps.value);
      }
    };

    const goBackToCategories = (): void => {
      currentView.value = View.Category;
    };

    return {
      View,
      dapps,
      currentView,
      currentCategory,
      canSubmit,
      handleCategorySelected,
      goBackToCategories,
      handleDappsSelected,
      submit,
    };
  },
});
</script>

<style lang="scss" scoped>
.buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;

  button {
    padding: 10px 20px;
    border-radius: 5px;
    color: white;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
  }
}
</style>
