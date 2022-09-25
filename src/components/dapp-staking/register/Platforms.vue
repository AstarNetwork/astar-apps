<template>
  <items-container :title="$t('dappStaking.modals.platformsTitle')" class="component">
    <items-toggle :available-items="possiblePlatforms" :item-toggled="handleItemToggled" />
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
      possiblePlatforms,
      handleItemToggled,
    };
  },
});
</script>

<style lang="scss" scoped></style>
