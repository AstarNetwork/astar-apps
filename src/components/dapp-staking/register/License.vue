<template>
  <items-container :title="$t('dappStaking.modals.license')" class="component">
    <q-radio
      v-for="(license, index) in possibleLicenses"
      :key="index"
      v-model="data.license"
      :val="license.value"
      :label="license.label"
      class="radio"
    />
  </items-container>
</template>

<script lang="ts">
import { Category, NewDappItem } from 'src/store/dapp-staking/state';
import { defineComponent, PropType, reactive } from 'vue';
import ItemsContainer from 'src/components/dapp-staking/register/ItemsContainer.vue';

export const possibleLicenses = [
  { label: 'GPL-3.0', value: 'GPL-3.0' },
  { label: 'MIT', value: 'MIT' },
  { label: 'GNU', value: 'GNU' },
];

export default defineComponent({
  components: {
    ItemsContainer,
  },
  props: {
    dapp: {
      type: Object as PropType<NewDappItem>,
      required: true,
    },
  },
  setup(props) {
    const data = reactive<NewDappItem>(props.dapp);

    const handleItemToggled = (selectedItems: string[]): void => {
      data.mainCategory = selectedItems[0] as Category;
    };

    return {
      data,
      possibleLicenses,
      handleItemToggled,
    };
  },
});
</script>

<style lang="scss" scoped>
.radio {
  margin-right: 20px;
  margin-top: 6px;
}
</style>
