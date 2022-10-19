<template>
  <items-container
    :title="$t('dappStaking.modals.platformsTitle')"
    :validation-error="validationError"
    class="component"
  >
    <items-toggle
      :available-items="possiblePlatforms"
      :item-toggled="handleItemToggled"
      :selected-items="data.platforms"
      class="container--toggle"
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
    validationError: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const data = reactive<NewDappItem>(props.dapp);
    const possiblePlatforms = [
      { label: 'Windows', value: 'windows' },
      { label: 'Mac', value: 'mac' },
      { label: 'iOS', value: 'ios' },
      { label: 'Android', value: 'android' },
    ];

    const handleItemToggled = (selectedItems: string[]): void => {
      data.platforms = selectedItems;
    };

    return {
      data,
      possiblePlatforms,
      handleItemToggled,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dapp-staking/styles/register.scss';
</style>
