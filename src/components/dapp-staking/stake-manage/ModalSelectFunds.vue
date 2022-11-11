<template>
  <modal-wrapper-v2
    :is-modal-open="isModalSelectFunds"
    :title="$t('select')"
    :is-closing="isClosingModal"
    :close-modal="closeModal"
    class-name="transfer-modal"
  >
    <div class="container--select-item-mobile">
      <div class="container--items">
        <div
          v-for="list in stakingList"
          :key="list.address"
          class="row--item"
          :class="selectedFunds === list.address && 'row--item-selected'"
          @click="setAddressTransferFrom(list.address)"
        >
          <div class="column--item-name">
            <img :src="list.iconUrl" :alt="list.name" class="item-logo" />
            <span class="text--item-name">{{ list.name }}</span>
            <div class="column--amount">
              <span>
                <token-balance
                  :balance="ethers.utils.formatEther(list.balance)"
                  :symbol="nativeTokenSymbol"
                />
              </span>
            </div>
          </div>
          <div />
        </div>
      </div>
    </div>
  </modal-wrapper-v2>
</template>
<script lang="ts">
import { fadeDuration } from '@astar-network/astar-ui';
import ModalWrapperV2 from 'src/components/common/ModalWrapperV2.vue';
import { StakingData } from 'src/modules/dapp-staking';
import { wait } from 'src/v2/common';
import { defineComponent, PropType, ref } from 'vue';
import { ethers } from 'ethers';
import { truncate } from 'src/hooks/helper/common';
import { useNetworkInfo } from 'src/hooks';
import TokenBalance from 'src/components/common/TokenBalance.vue';
export default defineComponent({
  components: {
    ModalWrapperV2,
    TokenBalance,
  },
  props: {
    isModalSelectFunds: {
      type: Boolean,
      required: true,
    },
    handleModalSelectFunds: {
      type: Function,
      required: true,
    },
    setAddressTransferFrom: {
      type: Function,
      required: true,
    },
    selectedFunds: {
      type: String,
      required: true,
    },
    stakingList: {
      type: Object as PropType<StakingData[]>,
      required: true,
    },
  },
  setup(props) {
    const isClosingModal = ref<boolean>(false);
    const closeModal = async (): Promise<void> => {
      isClosingModal.value = true;
      await wait(fadeDuration);
      props.handleModalSelectFunds({ isOpen: false });
      isClosingModal.value = false;
    };

    const { nativeTokenSymbol } = useNetworkInfo();
    return { closeModal, isClosingModal, ethers, truncate, nativeTokenSymbol };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dapp-staking/stake-manage/styles/select-funds.scss';
</style>
