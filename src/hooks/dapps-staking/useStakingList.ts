import { ethers } from 'ethers';
import { useAccount, useBalance, useNetworkInfo } from 'src/hooks';
import { StakingData } from 'src/modules/dapp-staking/index';
import { getTokenImage } from 'src/modules/token';
import { useStore } from 'src/store';
import { computed, ref, watchEffect } from 'vue';

export function useStakingList() {
  const { currentAccount } = useAccount();
  const { accountData } = useBalance(currentAccount);
  const { nativeTokenSymbol } = useNetworkInfo();
  const store = useStore();
  const isLoading = computed(() => store.getters['general/isLoading']);
  const dapps = computed(() => store.getters['dapps/getAllDapps']);
  const isH160 = computed(() => store.getters['general/isH160Formatted']);
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

  const setStakingList = async () => {
    const dappsRef = dapps.value;
    const accountDataRef = accountData.value;
    const currentAccountRef = currentAccount.value;
    if (!accountDataRef || !currentAccountRef || isH160.value) return;
    try {
      const data = dappsRef.map((it: any) => {
        const accountStakingAmount = it.stakerInfo.accountStakingAmount;
        if (Number(accountStakingAmount)) {
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

      data.unshift({
        address: currentAccountRef,
        name: 'Transferable Balance',
        balance: accountDataRef.getUsableFeeBalance().toString(),
        iconUrl: nativeTokenImg.value,
      });

      stakingList.value = data.filter((it: any) => it !== undefined);
    } catch (error) {
      console.error(error);
    }
  };

  watchEffect(async () => {
    if (isLoading.value || !dapps.value) {
      return;
    }
    try {
      await setStakingList();
    } catch (error) {
      console.error(error);
    }
  });

  return {
    stakingList,
    dapps,
  };
}
