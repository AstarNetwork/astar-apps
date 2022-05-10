import { $api } from 'src/boot/api';
import { useStore } from 'src/store';
import { computed, ref, watchEffect } from 'vue';
import { useAccount } from '../useAccount';
import { useBalance } from '../useBalance';
import { StakingData } from './../../modules/dapp-staking/index';
import { formatStakingList } from './../../modules/dapp-staking/utils/index';

export function useStakingList() {
  const { currentAccount } = useAccount();
  const { accountData } = useBalance(currentAccount);
  const store = useStore();
  const isLoading = computed(() => store.getters['general/isLoading']);
  const dapps = computed(() => store.getters['dapps/getAllDapps']);
  const isH160 = computed(() => store.getters['general/isH160Formatted']);

  const stakingList = ref<StakingData[]>([
    {
      address: '',
      name: 'Transferable Balance',
      balance: '0',
    },
  ]);

  const setStakingList = async () => {
    const dappsRef = dapps.value;
    const accountDataRef = accountData.value;
    const currentAccountRef = currentAccount.value;
    if (!accountDataRef || !currentAccountRef || isH160.value) return;
    try {
      const data = await formatStakingList({
        api: $api!,
        address: currentAccountRef,
        dapps: dappsRef,
      });

      data.unshift({
        address: currentAccountRef,
        name: 'Transferable Balance',
        balance: accountDataRef.getUsableFeeBalance().toString(),
      });
      stakingList.value = data;
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
