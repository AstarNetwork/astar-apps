<template>
  <div>
    <BackToPage
      :class="isHighlightRightUi && 'half-opacity'"
      :text="$t('dappStaking.backToDappList')"
      :link="Path.DappStaking"
    />
    <MobileNavigator v-if="currentAccount" />
    <div v-if="currentAccount" class="wrapper--stake-manage">
      <div class="container--stake-manage">
        <div class="wrapper-containers">
          <div>
            <StakeForm />
          </div>
          <Information v-if="rightUi === 'information'" />
        </div>
      </div>
    </div>
    <!-- <ModalSelectChain
      v-if="from && to"
      :is-modal-select-chain="isModalSelectFunds"
      :handle-modal-select-chain="handleModalSelectChain"
      :set-chain="handleSetChain"
      :chains="selectableChains"
      :selected-chain="isSelectFromChain ? from : to"
    /> -->
  </div>
</template>
<script lang="ts">
import Information from 'src/components/assets/transfer/Information.vue';
import MobileNavigator from 'src/components/assets/transfer/MobileNavigator.vue';
import BackToPage from 'src/components/common/BackToPage.vue';
import StakeForm from 'src/components/dapp-staking/stake-manage/StakeForm.vue';
import { useAccount, useBreakpoints } from 'src/hooks';
import { wait } from 'src/hooks/helper/common';
import { Path } from 'src/router';
import { computed, defineComponent, ref } from 'vue';

export type StakeRightUi = 'information' | 'select-funds-from';

export default defineComponent({
  components: {
    BackToPage,
    MobileNavigator,
    Information,
    StakeForm,
    // ModalSelectToken,
  },
  setup() {
    const isModalSelectFunds = ref<boolean>(false);
    const rightUi = ref<StakeRightUi>('information');

    const { currentAccount } = useAccount();
    const { screenSize, width } = useBreakpoints();

    const isHighlightRightUi = computed<boolean>(() => rightUi.value !== 'information');

    const setRightUi = async (ui: StakeRightUi): Promise<void> => {
      if (width.value > screenSize.md) {
        // Memo: tricky way to work with `cancelHighlight` function
        await wait(100);
        rightUi.value = ui;
      } else {
        if (ui === 'select-funds-from') {
          isModalSelectFunds.value = true;
        }
      }
    };

    // const cancelHighlight = async (e: any): Promise<void> => {
    //   const openClass = 'container--select-chain';
    //   if (isHighlightRightUi.value && e.target.className !== openClass) {
    //     await setRightUi('information');
    //   }
    // };

    return {
      isHighlightRightUi,
      rightUi,
      currentAccount,
      Path,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dapp-staking/stake-manage/styles/stake-manage.scss';
</style>
