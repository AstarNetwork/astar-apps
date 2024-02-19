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
              <token-balance-native
                :balance="availableToMove.toString()"
                class="nomination--balance"
              />
            </div>
            <div class="text--title stake--on">{{ $t('stakingV3.stakeVoteOn') }}</div>
          </div>
          <div v-for="dapp in selectedDapps" :key="dapp.address" class="dapp-amount">
            <dapp-selector
              :dapps="dapps"
              :on-select-dapps="handleSelectDapp"
              :placeholder="$t('stakingV3.voteProject')"
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
              :placeholder="
                $t(selectedDapps.length > 0 ? 'stakingV3.voteMoreProject' : 'stakingV3.voteProject')
              "
            />
          </div>

          <div class="balance">
            <div class="balance--row">
              <div>
                <b>{{ $t('stakingV3.availableToVote') }}</b>
              </div>
              <div>
                <b v-if="!isLoading"
                  ><token-balance-native :balance="availableToVoteDisplay.toString()"
                /></b>
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
                <div>
                  <token-balance-native :balance="totalStake.toString()" />
                </div>
              </div>
              <div class="balance--row" :class="remainLockedToken > BigInt(0) && 'warning--text'">
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
          <error-panel :error-message="errorMessage" :url="refUrl" />
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
            <b>{{ $t('stakingV3.voting.note') }}</b>
            <ul>
              <li>
                {{
                  $t('stakingV3.voting.minimumStakingAmount', {
                    amount: constants?.minStakeAmountToken,
                    symbol: nativeTokenSymbol,
                  })
                }}
              </li>
              <li>
                {{
                  $t('stakingV3.voting.minBalanceAfterStaking', {
                    amount: constants?.minBalanceAfterStaking,
                    symbol: nativeTokenSymbol,
                  })
                }}
              </li>
            </ul>
          </div>

          <div class="note">
            <b>{{ $t('stakingV3.voting.learn') }}</b>
            <ul>
              <li>
                <a
                  :href="docsUrl.learnDappStaking"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="link--learn"
                >
                  {{ $t('stakingV3.voting.whatIsDappStaking') }}
                </a>
              </li>
              <li>
                <a
                  :href="docsUrl.dappStakingForStakers"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="link--learn"
                >
                  {{ $t('stakingV3.voting.howToParticipate') }}
                </a>
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
import { abs, max } from 'src/v2/common';
import { useRoute } from 'vue-router';
import { CombinedDappInfo, DappStakeInfo } from '../logic';
import BackToPage from 'src/components/common/BackToPage.vue';
import RewardsPanel from './RewardsPanel.vue';
import ErrorPanel from './ErrorPanel.vue';
import { Path } from 'src/router';
import { docsUrl } from 'src/links';
import { useStore } from 'src/store';

export default defineComponent({
  components: {
    DappSelector,
    Amount,
    TokenBalanceNative,
    ModalSelectDapp,
    BackToPage,
    RewardsPanel,
    ErrorPanel,
  },
  setup() {
    const {
      constants,
      ledger,
      totalStake,
      isVotingPeriod,
      stakerInfo,
      canStake,
      claimLockAndStake,
    } = useDappStaking();
    const { registeredDapps, getDapp } = useDapps();
    const { navigateToAssets } = useDappStakingNavigation();
    const { nativeTokenSymbol } = useNetworkInfo();
    const { currentAccount } = useAccount();
    const { useableBalance } = useBalance(currentAccount);
    const route = useRoute();
    const store = useStore();
    const isLoading = computed<boolean>(() => store.getters['general/isLoading']);

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
      return locked.value - stakeToken - totalStake.value;
    });
    let remainLockedTokenInitial = BigInt(0);

    // Needed to display dApp name and logo on the page.
    const dAppToMoveTokensFrom = computed<CombinedDappInfo | undefined>(() =>
      getDapp(dAppToMoveFromAddress.value)
    );

    const availableToMove = computed<bigint>(() => {
      const info = stakerInfo?.value?.get(dAppToMoveFromAddress.value);
      if (info) {
        return info.staked.totalStake;
      }

      return BigInt(0);
    });

    const availableToVote = computed<bigint>(
      () =>
        BigInt(useableBalance.value) +
        max(remainLockedTokenInitial, BigInt(0)) +
        availableToMove.value
    );

    const availableToVoteDisplay = computed<bigint>(() =>
      remainLockedToken.value >= BigInt(0)
        ? BigInt(useableBalance.value) + remainLockedToken.value + availableToMove.value
        : BigInt(useableBalance.value) - abs(remainLockedToken.value) + availableToMove.value
    );

    const amountToUnstake = computed<bigint>(() =>
      availableToMove.value > totalStakeAmountBigInt.value
        ? totalStakeAmountBigInt.value
        : availableToMove.value
    );

    const stakeInfo = computed<DappStakeInfo[]>(() => {
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

      return stakeInfo;
    });

    const errorMessage = ref<string>('');
    const refUrl = ref<string>('');

    const canConfirm = (): boolean => {
      const [enabled, message, url] = canStake(stakeInfo.value, availableToVote.value);
      errorMessage.value = message;
      refUrl.value = url;

      return enabled && totalStakeAmount.value > 0;
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
      // If additional funds locking is required remainLockedToken value will be negative.
      // In case of nomination transfer no additional funds locking is required.
      const tokensToLock = remainLockedToken.value + availableToMove.value;
      await claimLockAndStake(
        stakeInfo.value,
        tokensToLock < 0 ? tokensToLock * BigInt(-1) : BigInt(0),
        dAppToMoveFromAddress.value,
        amountToUnstake.value
      );

      navigateToAssets();
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

    watch(
      [remainLockedToken],
      () => {
        if (remainLockedTokenInitial === BigInt(0)) {
          remainLockedTokenInitial = remainLockedToken.value;
        }
      },
      { immediate: true }
    );

    return {
      constants,
      nativeTokenSymbol,
      dapps,
      locked,
      availableToVote,
      availableToVoteDisplay,
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
      availableToMove,
      errorMessage,
      docsUrl,
      isLoading,
      stakeInfo,
      refUrl,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './styles/vote.scss';
</style>
