<template>
  <div v-if="dapp">
    <back-to-page
      :class="isHighlightRightUi && 'half-opacity'"
      :text="$t('dappStaking.stakePage.backToDappList')"
      :link="Path.DappStaking"
    />
    <mobile-navigator v-if="currentAccount" />
    <div v-if="currentAccount" class="wrapper--stake-manage">
      <div class="container--stake-manage">
        <div v-if="formattedTransferFrom.item" class="wrapper-containers">
          <div :class="isHighlightRightUi && 'half-opacity'">
            <stake-form
              :dapp="dapp"
              :set-right-ui="setRightUi"
              :formatted-transfer-from="formattedTransferFrom"
              :handle-stake="handleStake"
            />
          </div>
          <stake-information v-if="rightUi === 'information'" />
          <select-funds
            v-if="rightUi === 'select-funds-from'"
            v-click-away="cancelHighlight"
            :set-address-transfer-from="handleSetAddressTransferFrom"
            :staking-list="stakingList"
            :dapp-address="dappAddress"
          />
        </div>
      </div>
    </div>
    <modal-select-funds
      v-if="formattedTransferFrom.item"
      :is-modal-select-funds="isModalSelectFunds"
      :handle-modal-select-funds="handleModalSelectFunds"
      :staking-list="stakingList"
      :selected-funds="formattedTransferFrom.item.address"
      :set-address-transfer-from="handleSetAddressTransferFrom"
    />
  </div>
</template>
<script lang="ts">
import MobileNavigator from 'src/components/assets/transfer/MobileNavigator.vue';
import BackToPage from 'src/components/common/BackToPage.vue';
import ModalSelectFunds from './ModalSelectFunds.vue';
import SelectFunds from './SelectFunds.vue';
import StakeForm from './StakeForm.vue';
import StakeInformation from './StakeInformation.vue';
import {
  useBreakpoints,
  useDappRedirect,
  useDispatchGetDapps,
  useStake,
  useStakingList,
  useDecommission,
} from 'src/hooks';
import { useDappStakingNavigation } from 'src/staking-v3';
import { wait } from '@astar-network/astar-sdk-core';
import { Path } from 'src/router';
import { DappCombinedInfo } from 'src/v2/models';
import { computed, defineComponent, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

export type StakeRightUi = 'information' | 'select-funds-from';

export default defineComponent({
  components: {
    BackToPage,
    MobileNavigator,
    StakeForm,
    StakeInformation,
    SelectFunds,
    ModalSelectFunds,
  },
  setup() {
    const isModalSelectFunds = ref<boolean>(false);
    const rightUi = ref<StakeRightUi>('information');
    const { screenSize, width } = useBreakpoints();
    const route = useRoute();
    useDappRedirect();
    useDispatchGetDapps();
    const { setAddressTransferFrom, formattedTransferFrom, currentAccount, handleStake } =
      useStake();
    const { dapps, stakingList } = useStakingList();
    const { decommissionStarted } = useDecommission();
    const { navigateToHome } = useDappStakingNavigation();
    const isHighlightRightUi = computed<boolean>(() => rightUi.value !== 'information');
    const dappAddress = computed<string>(() => route.query.dapp as string);

    const handleModalSelectFunds = ({ isOpen }: { isOpen: boolean }): void => {
      isModalSelectFunds.value = isOpen;
    };

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

    const dapp = computed(() => {
      if (dapps.value.length > 0 && dappAddress.value) {
        return dapps.value.find((it: DappCombinedInfo) => {
          try {
            if (!it.dapp) return null;
            return it.dapp.address.toLowerCase() === dappAddress.value.toLowerCase();
          } catch (error) {
            return null;
          }
        });
      }
      return null;
    });

    const cancelHighlight = async (e: any): Promise<void> => {
      const openClass = 'container--select-funds';
      if (isHighlightRightUi.value && e.target.className !== openClass) {
        await setRightUi('information');
      }
    };

    const handleSetAddressTransferFrom = async (address: string) => {
      setAddressTransferFrom(address);
      await setRightUi('information');
      isModalSelectFunds.value && handleModalSelectFunds({ isOpen: false });
    };

    watch(
      [decommissionStarted],
      () => {
        if (decommissionStarted.value) {
          navigateToHome();
        }
      },
      { immediate: true }
    );

    return {
      isHighlightRightUi,
      rightUi,
      currentAccount,
      Path,
      dapp,
      formattedTransferFrom,
      stakingList,
      isModalSelectFunds,
      dappAddress,
      decommissionStarted,
      handleSetAddressTransferFrom,
      setRightUi,
      cancelHighlight,
      handleModalSelectFunds,
      handleStake,
    };
  },
});
</script>

<style lang="scss" scoped>
@use './styles/stake-manage.scss';
</style>
