<template>
  <items-container :title="$t('dappStaking.modals.contractTypeTitle')" class="component">
    <items-toggle
      :available-items="possibleContractTypes"
      :allow-multiselect="false"
      :selected-items="[possibleContractTypes[0].value]"
      :item-toggled="handleItemToggled"
    />
  </items-container>
</template>

<script lang="ts">
import { NewDappItem } from 'src/store/dapp-staking/state';
import { defineComponent, PropType, reactive } from 'vue';
import ItemsContainer from 'src/components/dapp-staking/register/ItemsContainer.vue';
import ItemsToggle from 'src/components/dapp-staking/register/ItemsToggle.vue';

export default defineComponent({
  components: {
    ItemsContainer,
    ItemsToggle,
  },
  props: {
    dapp: {
      type: Object as PropType<NewDappItem>,
      required: true,
    },
  },
  setup(props) {
    const data = reactive<NewDappItem>(props.dapp);
    const possibleContractTypes = [
      { label: 'EVM', value: 'evm' },
      { label: 'WASM', value: 'wasm' },
    ];

    data.contractType = possibleContractTypes[0].value;

    const handleItemToggled = (selectedItems: string[]): void => {
      if (selectedItems.length > 0) {
        data.contractType = selectedItems[0];
      }
    };

    return {
      possibleContractTypes,
      handleItemToggled,
    };
  },
});
</script>

<style lang="scss" scoped></style>
