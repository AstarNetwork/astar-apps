<template>
  <items-container :title="$t('dappStaking.modals.contractTypeTitle')" class="component">
    <div class="container--radio">
      <q-radio
        v-for="(category, index) in possibleContractTypes"
        :key="index"
        v-model="data.contractType"
        :val="category.value"
        :label="category.label"
        dense
        class="radio"
      />
    </div>
  </items-container>
</template>

<script lang="ts">
import { NewDappItem } from 'src/store/dapp-staking/state';
import { defineComponent, PropType, reactive } from 'vue';
import ItemsContainer from 'src/components/dapp-staking/register/ItemsContainer.vue';

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
    const possibleContractTypes = [
      { label: 'WASM+EVM', value: 'wasm+evm' },
      { label: 'WASM', value: 'wasm' },
      { label: 'EVM', value: 'evm' },
    ];

    data.contractType = possibleContractTypes[0].value;

    return {
      data,
      possibleContractTypes,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dapp-staking/styles/register.scss';
</style>
