import { Ref, computed, ref, watch } from 'vue';
import { CombinedDappInfo, DappStakeInfo, DappVote } from '../logic';
import { ethers } from 'ethers';
import { useAccount, useBalance } from 'src/hooks';
import { useDappStaking } from './useDappStaking';
import { abs, max } from 'src/v2/common';
import { useDapps } from './useDapps';
import { useDappStakingNavigation } from './useDappStakingNavigation';

export function useVote(dapps: Ref<DappVote[]>, dappToMoveTokensFromAddress?: string) {
  const { currentAccount } = useAccount();
  const { useableBalance } = useBalance(currentAccount);
  const { ledger, totalStake, canStake, getStakerInfo, claimLockAndStake } = useDappStaking();
  const { navigateToAssets } = useDappStakingNavigation();
  const { getDapp } = useDapps();

  const dAppToMoveFromAddress = ref<string>(dappToMoveTokensFromAddress ?? '');
  let remainingLockedTokensInitial = BigInt(0);

  const locked = computed<bigint>(() => ledger?.value?.locked ?? BigInt(0));

  const totalStakeAmount = computed<bigint>(() =>
    ethers.utils
      .parseEther(dapps.value.reduce((total, dapp) => total + dapp.amount, 0).toString())
      .toBigInt()
  );

  const remainingLockedTokens = computed<bigint>(() => {
    return locked.value - totalStakeAmount.value - totalStake.value;
  });

  const availableToMove = computed<bigint>(() => {
    const info = getStakerInfo(dAppToMoveFromAddress.value);
    if (info) {
      return info.staked.totalStake;
    }

    return BigInt(0);
  });

  const availableToVote = computed<bigint>(
    () =>
      BigInt(useableBalance.value) +
      max(remainingLockedTokensInitial, BigInt(0)) +
      availableToMove.value
  );

  const availableToVoteDisplay = computed<bigint>(() =>
    remainingLockedTokens.value >= BigInt(0)
      ? BigInt(useableBalance.value) + remainingLockedTokens.value + availableToMove.value
      : BigInt(useableBalance.value) - abs(remainingLockedTokens.value) + availableToMove.value
  );

  const amountToUnstake = computed<bigint>(() =>
    availableToMove.value > totalStakeAmount.value ? totalStakeAmount.value : availableToMove.value
  );

  const stakeInfo = computed<DappStakeInfo[]>(() => {
    const stakeInfo: DappStakeInfo[] = [];
    dapps.value.forEach((dapp) => {
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

  const dappToMoveTokensFrom = computed<CombinedDappInfo | undefined>(() => {
    if (dAppToMoveFromAddress.value) {
      return getDapp(dAppToMoveFromAddress.value);
    }

    return undefined;
  });

  const availableToMoveFrom = computed<bigint>(() => {
    const info = dAppToMoveFromAddress.value
      ? getStakerInfo(dAppToMoveFromAddress.value)
      : undefined;
    if (info) {
      return info.staked.totalStake;
    }
    return BigInt(0);
  });

  const errorMessage = ref<string>('');
  const refUrl = ref<string>('');

  const canVote = (): boolean => {
    const [enabled, message, url] = canStake(stakeInfo.value, availableToVote.value);
    errorMessage.value = message;
    refUrl.value = url;

    return enabled && totalStakeAmount.value > 0;
  };

  const vote = async (): Promise<void> => {
    // If additional funds locking is required remainLockedToken value will be negative.
    // In case of nomination transfer no additional funds locking is required.
    const tokensToLock = remainingLockedTokens.value + availableToMove.value;
    await claimLockAndStake(
      stakeInfo.value,
      tokensToLock < 0 ? tokensToLock * BigInt(-1) : BigInt(0),
      dAppToMoveFromAddress.value,
      amountToUnstake.value
    );

    navigateToAssets();
  };

  watch(
    [remainingLockedTokens],
    () => {
      if (remainingLockedTokensInitial === BigInt(0)) {
        remainingLockedTokensInitial = remainingLockedTokens.value;
      }
    },
    { immediate: true }
  );

  return {
    totalStakeAmount,
    remainingLockedTokens,
    availableToMove,
    availableToVoteDisplay,
    errorMessage,
    refUrl,
    dappToMoveTokensFrom,
    availableToMoveFrom,
    canVote,
    vote,
  };
}
