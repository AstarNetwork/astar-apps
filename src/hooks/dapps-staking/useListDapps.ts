import BN from 'bn.js';
import { $api } from 'boot/api';
import { useStore } from 'src/store';
import { computed, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAccount } from '../useAccount';
import { useBalance } from '../useBalance';
import { StakingData } from './../../modules/dapp-staking/index';
import { formatStakingList, getStakeInfo } from './../../modules/dapp-staking/utils/index';
import { StakeInfo } from './../../store/dapp-staking/actions';
import { DappItem } from './../../store/dapp-staking/state';

export function useListDapps() {
  const { currentAccount } = useAccount();
  const { accountData } = useBalance(currentAccount);
  const { t } = useI18n();

  const store = useStore();
  store.dispatch('dapps/getStakingInfo');
  store.dispatch('dapps/getDapps');

  const isLoading = computed(() => store.getters['general/isLoading']);
  const dapps = computed(() => store.getters['dapps/getAllDapps']);
  const isH160 = computed(() => store.getters['general/isH160Formatted']);

  const stakeInfos = ref<StakeInfo[]>();
  const stakingList = ref<StakingData[]>([
    {
      address: '',
      name: 'Transferable Balance',
      balance: new BN(0),
    },
  ]);

  const setStakingList = async () => {
    const dappsRef = dapps.value;
    const accountDataRef = accountData.value;
    const apiRef = $api.value!;
    const currentAccountRef = currentAccount.value;
    if (!accountDataRef || !currentAccountRef || isH160.value) return;
    try {
      const data = await formatStakingList({
        api: apiRef,
        address: currentAccountRef,
        dapps: dappsRef,
      });
      data.unshift({
        address: currentAccountRef,
        name: 'Transferable Balance',
        balance: accountDataRef.getUsableFeeBalance(),
      });
      stakingList.value = data;
    } catch (error) {
      console.error(error);
    }
  };

  const setStakeInfos = async () => {
    const data = await Promise.all<StakeInfo>(
      dapps.value.map(async (it: DappItem) => {
        return await getStakeInfo({
          api: $api.value!,
          dappAddress: it.address,
          currentAccount: currentAccount.value,
        });
      })
    );
    stakeInfos.value = data;
  };

  watch(
    [isLoading, currentAccount, dapps],
    async () => {
      if (isLoading.value || !dapps.value) {
        return;
      }
      try {
        await Promise.all([setStakeInfos(), setStakingList()]);
      } catch (error) {
        console.error(error);
      }
    },
    { immediate: false }
  );

  watchEffect(() => {
    if (isH160.value) {
      store.dispatch('general/showAlertMsg', {
        msg: t('dappStaking.error.onlySupportsSubstrate'),
        alertType: 'error',
      });
    }
  });

  return {
    stakingList,
    dapps,
    stakeInfos,
  };
}
