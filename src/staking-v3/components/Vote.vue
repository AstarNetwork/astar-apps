<template>
  <div class="wrapper--vote">
    <back-to-page :text="$t('stakingV3.back')" :link="Path.DappStaking" />
    <div class="title">{{ $t('stakingV3.voteTitle') }}</div>
    <div class="note">
      <b>{{ $t('toast.note') }}</b>
      <ul>
        <li>
          {{
            $t('stakingV3.minimumStakingAmount', {
              amount: constants?.minStakeAmountToken,
              symbol: nativeTokenSymbol,
            })
          }}
        </li>
        <li>
          {{
            $t('stakingV3.minBalanceAfterStaking', {
              amount: constants?.minBalanceAfterStaking,
              symbol: nativeTokenSymbol,
            })
          }}
        </li>
      </ul>
    </div>
    <div v-for="dapp in selectedDapps" :key="dapp.address" class="dapp-amount">
      <div class="dapp">
        <dapp-selector
          :dapps="dapps"
          :on-select-dapps="handleSelectDapp"
          :placeholder="$t('stakingV3.chooseProject')"
          :selected-dapp="dapp"
          :disable-selection="!canAddDapp"
        />
      </div>
      <div class="amount">
        <amount
          :amount="dapp.amount"
          :amount-changed="(amount) => handleAmountChanged(dapp, amount)"
        />
      </div>
    </div>
    <div v-if="canAddDapp" class="dapp amount-full-border">
      <dapp-selector
        :dapps="dapps"
        :on-select-dapps="handleSelectDapp"
        :placeholder="$t('stakingV3.chooseProject')"
      />
    </div>
    <div class="note">
      <b>{{ $t('stakingV3.availableToVote') }}</b>
      <div class="note--row">
        <div>{{ $t('stakingV3.totalTransferable') }}</div>
        <div><token-balance-native :balance="useableBalance" /></div>
      </div>
      <div class="note--row">
        <div>{{ $t('stakingV3.lockedForVoting') }}</div>
        <div><token-balance-native :balance="locked.toString()" /></div>
      </div>
      <div class="note--row">
        <div>{{ $t('stakingV3.alreadyVoted') }}</div>
        <div><token-balance-native :balance="totalStake.toString()" /></div>
      </div>
      <div class="note--row" :class="remainLockedToken !== BigInt(0) && 'warning--text'">
        <div>
          <b>{{
            remainLockedToken >= 0
              ? $t('stakingV3.remainLockedToken')
              : $t('stakingV3.tokensToBeLocked')
          }}</b>
        </div>
        <div>
          <b><token-balance-native :balance="abs(remainLockedToken).toString()" /></b>
        </div>
      </div>
      <div v-if="remainLockedToken !== BigInt(0)" class="note warning">
        {{
          remainLockedToken > BigInt(0)
            ? $t('stakingV3.voteLockedTokensWarning')
            : $t('stakingV3.additionalTokensLockedWarning')
        }}
      </div>
    </div>
    <rewards-panel />
    <div class="wrapper--button">
      <astar-button
        :disabled="!isConfirmable"
        style="width: 100%; height: 52px; font-size: 22px"
        @click="confirm"
      >
        {{ $t('confirm') }}
      </astar-button>
    </div>
    <modal-select-dapp
      :dapps="dapps"
      :is-modal-select-dapp="isModalSelectDapp"
      :handle-modal-select-dapp="handleModalSelectDapp"
      :dapps-selected="handleDappsSelected"
    />
  </div>
</template>
<script lang="ts">
import { defineComponent, computed, ref, watch } from 'vue';
import { useDappStaking, useDappStakingNavigation, useDapps } from '../hooks';
import { useAccount, useBalance, useNetworkInfo } from 'src/hooks';
import { DappSelector, Dapp } from './dapp-selector';
import Amount from './Amount.vue';
import TokenBalanceNative from 'src/components/common/TokenBalanceNative.vue';
import ModalSelectDapp from './dapp-selector/ModalSelectDapp.vue';
import { ethers } from 'ethers';
import { abs } from 'src/v2/common';
import { useRoute } from 'vue-router';
import { useStore } from 'src/store';
import { DappStakeInfo } from '../logic';
import BackToPage from 'src/components/common/BackToPage.vue';
import RewardsPanel from './RewardsPanel.vue';
import { Path } from 'src/router';

export default defineComponent({
  components: {
    DappSelector,
    Amount,
    TokenBalanceNative,
    ModalSelectDapp,
    BackToPage,
    RewardsPanel,
  },
  setup() {
    const { constants, ledger, totalStake, claimLockAndStake } = useDappStaking();
    const { registeredDapps } = useDapps();
    const { goBack } = useDappStakingNavigation();
    const { nativeTokenSymbol } = useNetworkInfo();
    const { currentAccount } = useAccount();
    const { useableBalance } = useBalance(currentAccount);
    const route = useRoute();

    const dapps = ref<Dapp[]>([]);
    const selectedDapps = ref<Dapp[]>([]);
    const selectedDappAddress = ref<string>((route.query.dappAddress as string) ?? '');
    const locked = computed<bigint>(() => ledger?.value?.locked ?? BigInt(0));
    const totalStakeAmount = computed<number>(() =>
      selectedDapps.value.reduce((total, dapp) => total + dapp.amount, 0)
    );
    const isModalSelectDapp = ref<boolean>(false);

    const remainLockedToken = computed<bigint>(() => {
      const stakeToken = ethers.utils.parseEther(totalStakeAmount.value.toString()).toBigInt();
      return locked.value - stakeToken - totalStake.value;
    });

    const store = useStore();

    // TODO this should be moved to useDappStaking.
    const canConfirm = (): [boolean, string] => {
      return [true, ''];
    };

    const handleDappsSelected = (dapps: Dapp[]): void => {
      selectedDapps.value = dapps;
    };

    const handleSelectDapp = (): void => {
      handleModalSelectDapp({ isOpen: true });
    };

    const handleAmountChanged = (dapp: Dapp, amount: number): void => {
      dapp.amount = amount;
    };

    const handleModalSelectDapp = ({ isOpen }: { isOpen: boolean }): void => {
      isModalSelectDapp.value = isOpen;
    };

    const canAddDapp = computed<boolean>((): boolean => selectedDappAddress.value === '');

    const confirm = async (): Promise<void> => {
      const [result, error] = canConfirm();
      if (!result) {
        throw error;
      }

      const stakeInfo: DappStakeInfo[] = [];
      selectedDapps.value.forEach((dapp) => {
        if (dapp.amount > 0) {
          stakeInfo.push({
            id: dapp.id,
            address: dapp.address,
            amount: dapp.amount,
          });
        }
      });

      // If additional funds locking is required remainLockedToken value will be negative.
      await claimLockAndStake(
        stakeInfo,
        remainLockedToken.value < 0 ? remainLockedToken.value * BigInt(-1) : BigInt(0)
      );

      goBack();
    };

    watch(
      [dapps],
      () => {
        if (dapps.value.length === 0) {
          dapps.value = registeredDapps.value.map((dapp) => ({
            name: dapp.basic.name,
            address: dapp.basic.address,
            logoUrl: dapp.basic.iconUrl,
            amount: 0,
            id: dapp.chain.id,
          }));
        }

        if (selectedDappAddress.value) {
          const dapp = dapps.value.find((dapp) => dapp.address === selectedDappAddress.value);
          if (dapp) {
            selectedDapps.value = [dapp];
          }
        }
      },
      {
        immediate: true,
      }
    );

    return {
      constants,
      nativeTokenSymbol,
      dapps,
      locked,
      useableBalance,
      totalStake,
      remainLockedToken,
      canConfirm,
      selectedDapps,
      isModalSelectDapp,
      handleDappsSelected,
      handleAmountChanged,
      confirm,
      abs,
      handleModalSelectDapp,
      handleSelectDapp,
      canAddDapp,
      Path,
    };
  },
  computed: {
    isConfirmable() {
      const [confirmable, errorMessage] = this.canConfirm();
      if (!confirmable) {
        // console.log(errorMessage);
      }
      return confirmable;
    },
  },
});
</script>

<style lang="scss" scoped>
@import './styles/vote.scss';
</style>
