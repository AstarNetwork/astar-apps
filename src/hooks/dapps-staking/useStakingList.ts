import { ethers } from 'ethers';
import { useAccount, useBalance, useNetworkInfo } from 'src/hooks';
import { StakingData } from 'src/modules/dapp-staking/index';
import { getTokenImage } from 'src/modules/token';
import { useStore } from 'src/store';
import { DappCombinedInfo } from 'src/v2/models/DappsStaking';
import { computed, ref, watch } from 'vue';

export function useStakingList() {
  const { senderSs58Account } = useAccount();
  const { accountData } = useBalance(senderSs58Account);
  const { nativeTokenSymbol } = useNetworkInfo();
  const store = useStore();
  const isLoading = computed(() => store.getters['general/isLoading']);
  const dapps = computed<DappCombinedInfo[]>(() => store.getters['dapps/getAllDapps']);
  const nativeTokenImg = computed<string>(() =>
    getTokenImage({ isNativeToken: true, symbol: nativeTokenSymbol.value })
  );

  const stakingList = ref<StakingData[]>([
    {
      address: '',
      name: 'Transferable Balance',
      balance: '0',
      iconUrl: '',
    },
  ]);

  const setStakingList = async (): Promise<void> => {
    const dappsRef = dapps.value;
    const accountDataRef = accountData.value;
    const senderSs58AccountRef = senderSs58Account.value;
    if (!accountDataRef || !senderSs58AccountRef) return;
    try {
      const data = dappsRef.map((it) => {
        const accountStakingAmount = it.stakerInfo.accountStakingAmount;
        if (it.dapp && Number(accountStakingAmount)) {
          return {
            address: it.dapp.address,
            balance: ethers.utils.parseEther(accountStakingAmount).toString(),
            name: it.dapp.name,
            iconUrl: it.dapp.iconUrl,
          };
        } else {
          return undefined;
        }
      });

      const balance = accountDataRef.getUsableFeeBalance().toString();
      data.unshift({
        address: senderSs58AccountRef,
        name: 'Transferable Balance',
        balance,
        iconUrl: nativeTokenImg.value,
      });

      stakingList.value = data.filter((it) => it !== undefined) as StakingData[];
    } catch (error) {
      console.error(error);
    }
  };

  watch([isLoading, senderSs58Account, accountData], async () => {
    if (isLoading.value || !dapps.value || !senderSs58Account.value) {
      return;
    }
    await setStakingList();
  });

  return {
    stakingList,
    dapps,
  };
}
