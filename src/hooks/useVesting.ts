import type { SubmittableExtrinsic, SubmittableExtrinsicFunction } from '@polkadot/api/types';
import { $api } from 'boot/api';
import { ethers } from 'ethers';
import { useStore } from 'src/store';
import { computed } from 'vue';
import { getInjector } from './helper/wallet';
import { useBalance, ExtendedVestingInfo } from './useBalance';
import { useCustomSignature } from './useCustomSignature';

export function useVesting(closeModal: () => void) {
  const store = useStore();
  const selectedAddress = computed(() => store.getters['general/selectedAddress']);
  const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);
  const { accountData } = useBalance(selectedAddress);

  const { callFunc, dispatchError, isCustomSig, handleResult, handleTransactionError } =
    useCustomSignature({ fn: closeModal });

  const info = computed(() => {
    const defaultData = {
      claimableAmount: 0,
      vestings: [
        {
          vestedAmount: 0,
          totalDistribution: 0,
          unlockPerBlock: 0,
          untilBlock: 0,
        },
      ],
    };
    try {
      if (accountData.value && accountData.value.vesting.length) {
        const claimableAmount = Number(
          ethers.utils.formatEther(accountData.value.vestedClaimable.toString())
        );

        const vestings = accountData.value.vesting.map((vesting: ExtendedVestingInfo) => {
          const { perBlock, locked, startingBlock } = vesting.basicInfo;
          const vestedAmount = Number(ethers.utils.formatEther(vesting.vested.toString()));
          const totalDistribution = Number(ethers.utils.formatEther(locked.toString()));
          const unlockPerBlock = Number(ethers.utils.formatEther(perBlock.toString()));
          const block = locked.div(perBlock).add(startingBlock);
          const untilBlock = block.toNumber();
          return {
            vestedAmount,
            totalDistribution,
            unlockPerBlock,
            untilBlock,
          };
        });

        const data = {
          claimableAmount,
          vestings,
        };
        return data;
      } else {
        return defaultData;
      }
    } catch (error) {
      console.error(error);
      return defaultData;
    }
  });

  const unlockVestedTokensCustomExtrinsic = async (): Promise<void> => {
    try {
      const fn: SubmittableExtrinsicFunction<'promise'> | undefined = $api?.tx.vesting.vest;
      const method: SubmittableExtrinsic<'promise'> | undefined = fn && fn();
      method && callFunc(method);
    } catch (e) {
      dispatchError((e as Error).message);
    }
  };

  const unlockVestedTokens = async (): Promise<void> => {
    try {
      const apiRef = $api;
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
    info,
    sendTransaction,
  };
}
