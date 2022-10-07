import { useGasPrice, ExtendedVestingInfo, useBalance, useCustomSignature } from 'src/hooks';
import { ApiPromise } from '@polkadot/api';
import { ISubmittableResult } from '@polkadot/types/types';
import { $api } from 'boot/api';
import { ethers } from 'ethers';
import { useStore } from 'src/store';
import { computed } from 'vue';
import { signAndSend } from 'src/hooks/helper/wallet';

export function useVesting(closeModal: () => void) {
  const store = useStore();
  const selectedAddress = computed(() => store.getters['general/selectedAddress']);
  const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);
  const { accountData } = useBalance(selectedAddress);
  const { selectedTip, nativeTipPrice, setSelectedTip } = useGasPrice();

  const { isCustomSig, handleResult, handleCustomExtrinsic } = useCustomSignature({
    fn: closeModal,
  });

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

  const unlockVestedTokens = async (api: ApiPromise): Promise<void> => {
    try {
      const txResHandler = async (result: ISubmittableResult): Promise<boolean> => {
        return await handleResult(result);
      };

      await signAndSend({
        transaction: api.tx.vesting.vest(),
        senderAddress: selectedAddress.value,
        substrateAccounts: substrateAccounts.value,
        isCustomSignature: isCustomSig.value,
        txResHandler,
        handleCustomExtrinsic,
        dispatch: store.dispatch,
        tip: selectedTip.value.price,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const sendTransaction = async (): Promise<void> => {
    await unlockVestedTokens($api!);
  };

  return {
    info,
    sendTransaction,
    selectedTip,
    nativeTipPrice,
    setSelectedTip,
  };
}
