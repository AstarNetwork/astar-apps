import { ethers } from 'ethers';
import { type ExtendedVestingInfo, useBalance, useGasPrice } from "src/hooks";
import { formatEtherAsNumber } from "src/lib/formatters";
import { useStore } from 'src/store';
import { container } from 'src/v2/common';
import type { IAssetsService } from "src/v2/services";
import { Symbols } from 'src/v2/symbols';
import { computed } from 'vue';

export const useVesting = () => {
  const store = useStore();
  const selectedAddress = computed(() => store.getters['general/selectedAddress']);
  const { accountData } = useBalance(selectedAddress);
  const { selectedTip, nativeTipPrice, setSelectedTip } = useGasPrice();

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
      if (accountData.value?.vesting.length) {
        const claimableAmount = formatEtherAsNumber(accountData.value.vestedClaimable.toString());

        const vestings = accountData.value.vesting.map((vesting: ExtendedVestingInfo) => {
          const { perBlock, locked, startingBlock } = vesting.basicInfo;
          const vestedAmount = formatEtherAsNumber(vesting.vested.toString());
          const totalDistribution = formatEtherAsNumber(locked.toString());
          const unlockPerBlock = formatEtherAsNumber(perBlock.toString());
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

  const sendTransaction = async (): Promise<void> => {
    const assetsService = container.get<IAssetsService>(Symbols.AssetsService);
    await assetsService.unlockVestingTokens(selectedAddress.value);
  };

  return {
    info,
    sendTransaction,
    selectedTip,
    nativeTipPrice,
    setSelectedTip,
  };
};
