import { $api } from 'boot/api';
import { useStore } from 'src/store';
import { computed, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAccount } from '../useAccount';
import { getStakeInfo } from './../../modules/dapp-staking/utils/index';
import { StakeInfo } from './../../store/dapp-staking/actions';
import { DappItem } from './../../store/dapp-staking/state';

export function useStakerInfo() {
  const { currentAccount } = useAccount();
  const { t } = useI18n();
  const store = useStore();
  store.dispatch('dapps/getStakingInfo');
  store.dispatch('dapps/getDapps');

  const stakeInfos = ref<StakeInfo[]>();
  const isLoading = computed(() => store.getters['general/isLoading']);
  const dapps = computed(() => store.getters['dapps/getAllDapps']);
  const isH160 = computed(() => store.getters['general/isH160Formatted']);

  const setStakeInfo = async () => {
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

  watchEffect(async () => {
    if (isLoading.value || !dapps.value) {
      return;
    }
    try {
      await setStakeInfo();
    } catch (error) {
      console.error(error);
    }
  });

  watchEffect(() => {
    if (isH160.value) {
      store.dispatch('general/showAlertMsg', {
        msg: t('dappStaking.error.onlySupportsSubstrate'),
        alertType: 'error',
      });
    }
  });

  return {
    stakeInfos,
  };
}
