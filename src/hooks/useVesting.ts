import type { SubmittableExtrinsic, SubmittableExtrinsicFunction } from '@polkadot/api/types';
import { $api } from 'boot/api';
import { ethers } from 'ethers';
import { useStore } from 'src/store';
import { computed } from 'vue';
import { getInjector } from './helper/wallet';
import { useBalance } from './useBalance';
import { useCustomSignature } from './useCustomSignature';

export function useVesting(closeModal: () => void) {
  const store = useStore();
  const selectedAddress = computed(() => store.getters['general/selectedAddress']);
  const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);
  const { accountData } = useBalance(selectedAddress);

  const { callFunc, dispatchError, isCustomSig, handleResult, handleTransactionError } =
    useCustomSignature(closeModal);

  const claimableAmount = computed(() => {
    try {
      const amount = accountData.value
        ? ethers.utils.formatEther(accountData.value.vestedClaimable.toString())
        : 0;
      return Number(amount);
    } catch (error) {
      return 0;
    }
  });

  const vestedAmount = computed(() => {
    try {
      const vested = accountData.value
        ? ethers.utils.formatEther(accountData.value.vesting[0].vested.toString())
        : 0;
      return Number(vested);
    } catch (error) {
      return 0;
    }
  });

  const totalDistribution = computed(() => {
    try {
      const amount = accountData.value
        ? ethers.utils.formatEther(accountData.value.vesting[0].basicInfo.locked.toString())
        : 0;
      return Number(amount);
    } catch (error) {
      return 0;
    }
  });

  const unlockPerBlock = computed(() => {
    try {
      const perBlock = accountData.value
        ? ethers.utils.formatEther(accountData.value.vesting[0].basicInfo.perBlock.toString())
        : 0;
      return Number(perBlock);
    } catch (error) {
      return 0;
    }
  });

  const untilBlock = computed(() => {
    try {
      if (accountData.value) {
        const { perBlock, locked, startingBlock } = accountData.value.vesting[0].basicInfo;
        const block = locked.div(perBlock).add(startingBlock);
        return block.toNumber();
      }
      return 0;
    } catch (error) {
      return 0;
    }
  });

  const unlockVestedTokensCustomExtrinsic = async (): Promise<void> => {
    try {
      const fn: SubmittableExtrinsicFunction<'promise'> | undefined = $api?.value?.tx.vesting.vest;
      const method: SubmittableExtrinsic<'promise'> | undefined = fn && fn();
      method && callFunc(method);
    } catch (e) {
      dispatchError((e as Error).message);
    }
  };

  const unlockVestedTokens = async (): Promise<void> => {
    try {
      const apiRef = $api.value;
      if (!apiRef) {
        throw Error('Cannot connect to the API');
      }
      const injector = await getInjector(substrateAccounts.value);
      apiRef.tx.vesting
        .vest()
        .signAndSend(
          selectedAddress.value,
          {
            signer: injector.signer,
          },
          (result) => handleResult(result)
        )
        .catch((error: Error) => handleTransactionError(error));
    } catch (e) {
      console.error(e);
    }
  };

  const sendTransaction = async (amount: number): Promise<void> => {
    if (isCustomSig.value) {
      await unlockVestedTokensCustomExtrinsic();
    } else {
      await unlockVestedTokens();
    }
  };

  return {
    claimableAmount,
    vestedAmount,
    totalDistribution,
    unlockPerBlock,
    untilBlock,
    sendTransaction,
  };
}
