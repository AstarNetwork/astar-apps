<template>
  <div class="container--nomination-transfer">
    <div class="button-account">
      <input
        :value="formattedTransferFrom.text"
        class="box--input input--transfer-from"
        type="text"
        spellcheck="false"
        :readonly="true"
        @focus="openOption = true"
        @blur="closeOption"
      />

      <div class="box--arrow">
        <icon-base class="icon--arrow" icon-name="selector" viewBox="0 0 20 20" aria-hidden="true">
          <icon-solid-selector />
        </icon-base>
      </div>
    </div>

    <div v-if="openOption" class="container--option">
      <ul class="box--option">
        <ModalSelectTransferFrom
          v-for="(item, index) in stakingList"
          :key="index"
          :set-address-transfer-from="setAddressTransferFrom"
          :current-account="currentAccount"
          :item="item"
          :checked="formattedTransferFrom.item.address === item.address"
        />
      </ul>
    </div>
  </div>
</template>
<script lang="ts">
import IconBase from 'components/icons/IconBase.vue';
import IconSolidSelector from 'components/icons/IconSolidSelector.vue';
import ModalSelectTransferFrom from 'src/components/dapp-staking/modals/ModalSelectTransferFrom.vue';
import { StakingData } from 'src/modules/dapp-staking';
import { defineComponent, PropType, ref } from 'vue';

export default defineComponent({
  components: {
    IconBase,
    ModalSelectTransferFrom,
    IconSolidSelector,
  },
  props: {
    stakingList: {
      type: Array as PropType<StakingData[]>,
      required: true,
    },
    formattedTransferFrom: {
      type: Object,
      required: false,
      default: null,
    },
    setAddressTransferFrom: {
      type: Function,
      required: true,
    },
    currentAccount: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const openOption = ref<boolean>(false);

    const closeOption = () => {
      setTimeout(() => {
        openOption.value = false;
      }, 400);
    };

    return {
      openOption,
      closeOption,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dapp-staking/styles/modal-nomination-transfer.scss';
</style>
