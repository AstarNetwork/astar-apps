import { Ref, computed } from 'vue';
import { DappVote } from '../logic';
import { ethers } from 'ethers';
import { useAccount, useBalance } from 'src/hooks';
import { useDappStaking } from './useDappStaking';

export function useVote(dapps: Ref<DappVote[]>) {
  const { currentAccount } = useAccount();
  const { useableBalance } = useBalance(currentAccount);
  const { ledger, totalStake } = useDappStaking();

  const locked = computed<bigint>(() => ledger?.value?.locked ?? BigInt(0));

  const totalStakeAmount = computed<bigint>(() =>
    ethers.utils
      .parseEther(dapps.value.reduce((total, dapp) => total + dapp.amount, 0).toString())
      .toBigInt()
  );

  const remainingLockedTokens = computed<bigint>(() => {
    return locked.value - totalStakeAmount.value - totalStake.value;
  });

  const canSubmit = computed<boolean>(() => totalStakeAmount.value > BigInt(0));

  return { totalStakeAmount, remainingLockedTokens, canSubmit };
}
