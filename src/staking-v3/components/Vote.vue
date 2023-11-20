<template>
  <div class="wrapper--vote">
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
    <div>
      <div class="dapp">
        <dapp-selector
          :dapps="dapps"
          :on-dapp-selected="handleDappSelected"
          :placeholder="$t('stakingV3.chooseProject')"
          :selected-dapp-address="selectedDappAddress"
        />
      </div>
      <div class="amount">
        <amount :amount-changed="handleAmountChanged" />
      </div>
    </div>
    <div class="note">
      <b>{{ $t('stakingV3.availableToVote') }}</b>
      <div class="note--row">
        <div>{{ $t('stakingV3.totalTransferable') }}</div>
        <div><format-balance :balance="useableBalance" /></div>
      </div>
      <div class="note--row">
        <div>{{ $t('stakingV3.lockedForVoting') }}</div>
        <div><format-balance :balance="locked.toString()" /></div>
      </div>
      <div class="note--row">
        <div>{{ $t('stakingV3.alreadyVoted') }}</div>
        <div><format-balance :balance="totalStake.toString()" /></div>
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
          <b><format-balance :balance="abs(remainLockedToken).toString()" /></b>
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
    <div v-if="hasRewards" class="note">
      <b>{{ $t('stakingV3.rewardsWillBeClaimed') }}</b>
      <div class="note--row">
        <div>{{ $t('stakingV3.basicRewards') }}</div>
        <div><format-balance :balance="rewards?.staker.toString() ?? ''" /></div>
      </div>
      <div class="note--row">
        <div>{{ $t('stakingV3.bonusRewards') }}</div>
        <div><format-balance :balance="rewards?.bonus.toString() ?? ''" /></div>
      </div>
      <div class="note--row">
        <div>{{ $t('stakingV3.dAppRewards') }}</div>
        <div><format-balance :balance="rewards?.dApp.toString() ?? ''" /></div>
      </div>
    </div>
    <div class="wrapper--button">
      <astar-button
        :disabled="!canConfirm"
        style="width: 100%; height: 52px; font-size: 22px"
        @click="confirm"
      >
        {{ $t('confirm') }}
      </astar-button>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { useDappStaking, useDapps } from '../hooks';
import { useAccount, useBalance, useNetworkInfo } from 'src/hooks';
import { DappSelector, Dapp } from './dapp-selector';
import Amount from './Amount.vue';
import FormatBalance from 'src/components/common/FormatBalance.vue';
import { ethers } from 'ethers';
import { abs } from 'src/v2/common';
import { useRoute } from 'vue-router';

export default defineComponent({
  components: {
    DappSelector,
    Amount,
    FormatBalance,
  },
  setup() {
    const { constants, ledger, totalStake, hasRewards, rewards, claimLockAndStake } =
      useDappStaking();
    const { registeredDapps } = useDapps();
    const { nativeTokenSymbol } = useNetworkInfo();
    const { currentAccount } = useAccount();
    const { useableBalance } = useBalance(currentAccount);
    const route = useRoute();

    const selectedDapp = ref<Dapp | undefined>(undefined);
    const selectedDappAddress = ref<string>((route.query.dappAddress as string) ?? '');
    const locked = computed<bigint>(() => ledger?.value?.locked ?? BigInt(0));
    const stakeAmount = ref<number>(0);

    console.log('fsdf', selectedDappAddress.value);

    const remainLockedToken = computed<bigint>(() => {
      const stakeToken = ethers.utils.parseEther(stakeAmount.value.toString()).toBigInt();
      return locked.value - stakeToken - totalStake.value;
    });

    const canConfirm = computed<boolean>(
      () => !!selectedDapp.value?.address && stakeAmount.value > 0
    );

    const dapps = computed<Dapp[]>(() => {
      return registeredDapps.value.map((dapp) => ({
        name: dapp.basic.name,
        address: dapp.basic.address,
        logoUrl: dapp.basic.iconUrl,
      }));
    });

    const handleDappSelected = (dapp: Dapp): void => {
      selectedDapp.value = dapp;
    };

    const handleAmountChanged = (amount: number): void => {
      stakeAmount.value = amount;
    };

    const confirm = async (): Promise<void> => {
      // TODO at the moment only one dApp is supported for staking. This will change in the future.
      // If additional funds locking is required remainLockedToken value will be negative.
      if (canConfirm) {
        const stakeInfo = new Map<string, number>();
        stakeInfo.set(selectedDapp.value?.address ?? '', stakeAmount.value);
        await claimLockAndStake(
          stakeInfo,
          remainLockedToken.value < 0 ? remainLockedToken.value * BigInt(-1) : BigInt(0)
        );
      }
    };

    return {
      constants,
      nativeTokenSymbol,
      dapps,
      locked,
      useableBalance,
      totalStake,
      remainLockedToken,
      hasRewards,
      canConfirm,
      rewards,
      selectedDappAddress,
      handleDappSelected,
      handleAmountChanged,
      confirm,
      abs,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

ul {
  margin: 0 8px;
  padding-left: 24px;
}

li {
  list-style-type: disc;
}

.wrapper--vote {
  padding: 16px;
  max-width: 412px;
  @media (min-width: $xl) {
    justify-content: center;
  }
}

.title {
  color: $navy-1;
  font-size: 32px;
  font-style: normal;
  font-weight: 800;
  line-height: normal;
  letter-spacing: -0.64px;
}

.note {
  padding: 16px;
  gap: 8px;
  align-self: stretch;
  border-radius: 16px;
  background-color: $gray-1;
  margin: 16px 0;
}

.warning {
  background-color: rgba(230, 0, 122, 0.05);
  border: 1px solid $astar-pink;
  color: $astar-pink;
}

.warning--text {
  color: $astar-pink;
}

.note--row {
  display: flex;
  justify-content: space-between;
}

.dapp {
  border-radius: 16px 16px 0px 0px;
  border: 1px solid $gray-3;
  border-bottom-width: 0px;
  padding: 24px 8px;
}

.amount {
  border-radius: 0px 0px 16px 16px;
  border: 1px solid $gray-3;
  border-top-width: 0px;
  padding: 24px 8px;
}

.body--dark {
  .title {
    color: $gray-1;
  }

  .note {
    background-color: $navy-3;
  }

  .btn--confirm {
    width: 100%;
    font-size: 22px;
    font-weight: 600;
    height: 52px;
  }

  .wrapper--button {
    width: 100%;
    height: auto;
  }
}
</style>
