<template>
  <div>
    <div class="wrapper--vote">
      <back-to-page :text="$t('stakingV3.back')" :link="Path.DappStaking" />
      <div class="title">
        {{ isVotingPeriod ? $t('stakingV3.voteTitle') : $t('stakingV3.stakeTitle') }}
      </div>
      <div v-if="dAppToMoveTokensFrom" class="text--title">
        {{ $t('stakingV3.transferText') }}
      </div>
      <div v-else-if="isVotingPeriod" class="text--title">{{ $t('stakingV3.voteText') }}</div>
      <div class="inner--vote">
        <div class="column--main">
          <div v-if="dAppToMoveTokensFrom">
            <div class="move--from">
              <img :src="dAppToMoveTokensFrom.basic.iconUrl" />
              <div>{{ dAppToMoveTokensFrom.basic.name }}</div>
            </div>
            <div class="text--title stake--on">{{ $t('stakingV3.stakeVoteOn') }}</div>
          </div>
          <div v-for="dapp in selectedDapps" :key="dapp.address" class="dapp-amount">
            <dapp-selector
              :dapps="dapps"
              :on-select-dapps="handleSelectDapp"
              :placeholder="$t('stakingV3.chooseProject')"
              :selected-dapp="dapp"
              :disable-selection="!canAddDapp"
            />
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

          <div class="balance">
            <div class="balance--row">
              <div>
                <b>{{ $t('stakingV3.availableToVote') }}</b>
              </div>
              <div>
                <b><token-balance-native :balance="useableBalance" /></b>
              </div>
            </div>

            <div class="container--locked-balance">
              <div class="balance--row">
                <div>
                  {{ $t('stakingV3.lockedBalance') }}
                </div>
                <div><token-balance-native :balance="locked.toString()" /></div>
              </div>
              <div class="balance--row">
                <div>
                  {{
                    isVotingPeriod ? $t('stakingV3.alreadyVoted') : $t('stakingV3.alreadyStaked')
                  }}
                </div>
                <div><token-balance-native :balance="totalStake.toString()" /></div>
              </div>
              <div class="balance--row" :class="remainLockedToken !== BigInt(0) && 'warning--text'">
                <div>
                  <b>{{ $t('stakingV3.remainingLockedBalance') }}</b>
                </div>
                <div>
                  <b
                    ><token-balance-native :balance="max(remainLockedToken, BigInt(0)).toString()"
                  /></b>
                </div>
              </div>
              <div v-if="remainLockedToken > BigInt(0)" class="note warning">
                {{ $t('stakingV3.voteLockedTokensWarning') }}
              </div>
            </div>

            <div class="balance--row">
              <div>
                <b>{{ isVotingPeriod ? $t('stakingV3.totalVote') : $t('stakingV3.totalStake') }}</b>
              </div>
              <div>
                <b><token-balance-native :balance="totalStakeAmountBigInt?.toString() ?? '0'" /></b>
              </div>
            </div>
          </div>
          <rewards-panel />
          <div class="wrapper--button">
            <astar-button
              :disabled="!canConfirm()"
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

        <div class="column--help">
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
        </div>
      </div>
    </div>
    <div
      class="bg--vote"
      :style="{ backgroundImage: `url(${require('/src/staking-v3/assets/vote_bg.webp')})` }"
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
import { max } from 'src/v2/common';
import { useRoute } from 'vue-router';
import { CombinedDappInfo, DappStakeInfo } from '../logic';
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
    const { constants, ledger, totalStake, isVotingPeriod, claimLockAndStake } = useDappStaking();
    const { registeredDapps, getDapp } = useDapps();
    const { stakerInfo } = useDappStaking();
    const { goBack } = useDappStakingNavigation();
    const { nativeTokenSymbol } = useNetworkInfo();
    const { currentAccount } = useAccount();
    const { useableBalance } = useBalance(currentAccount);
    const route = useRoute();

    const dapps = ref<Dapp[]>([]);
    const selectedDapps = ref<Dapp[]>([]);
    const selectedDappAddress = ref<string>((route.query.dappAddress as string) ?? '');
    const dAppToMoveFromAddress = ref<string>((route.query.moveFromAddress as string) ?? '');
    const locked = computed<bigint>(() => ledger?.value?.locked ?? BigInt(0));
    const totalStakeAmount = computed<number>(() =>
      selectedDapps.value.reduce((total, dapp) => total + dapp.amount, 0)
    );
    const totalStakeAmountBigInt = computed<bigint>(() =>
      ethers.utils.parseEther(totalStakeAmount.value.toString()).toBigInt()
    );
    const isModalSelectDapp = ref<boolean>(false);

    const remainLockedToken = computed<bigint>(() => {
      const stakeToken = ethers.utils.parseEther(totalStakeAmount.value.toString()).toBigInt();
      return locked.value + availableToMove.value - stakeToken - totalStake.value;
    });

    // Needed to display dApp name and logo on the page.
    const dAppToMoveTokensFrom = computed<CombinedDappInfo | undefined>(() =>
      getDapp(dAppToMoveFromAddress.value)
    );

    const availableToMove = computed<bigint>(() => {
      const info = stakerInfo?.value?.get(dAppToMoveFromAddress.value);
      if (info) {
        return info.staked.buildAndEarn + info.staked.voting;
      }

      return BigInt(0);
    });

    const amountToUnstake = computed<bigint>(() =>
      availableToMove.value > totalStakeAmountBigInt.value
        ? totalStakeAmountBigInt.value
        : availableToMove.value
    );

    const canConfirm = (): boolean => {
      // TODO use canStake from useDappStaking after multiple stakes will be supported.
      return totalStakeAmount.value > 0;
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
        remainLockedToken.value < 0 ? remainLockedToken.value * BigInt(-1) : BigInt(0),
        dAppToMoveFromAddress.value,
        amountToUnstake.value
      );

      goBack();
    };

    watch(
      [registeredDapps],
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
          const dapp = dapps.value.find(
            (dapp) => dapp.address.toLowerCase() === selectedDappAddress.value.toLowerCase()
          );
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
      totalStakeAmountBigInt,
      remainLockedToken,
      canConfirm,
      selectedDapps,
      isModalSelectDapp,
      handleDappsSelected,
      handleAmountChanged,
      confirm,
      max,
      handleModalSelectDapp,
      handleSelectDapp,
      canAddDapp,
      Path,
      isVotingPeriod,
      dAppToMoveTokensFrom,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './styles/vote.scss';
</style>
