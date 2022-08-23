import { $api } from 'boot/api';
import { useStore } from 'src/store';
import { computed, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAccount } from '../useAccount';
import { useNetworkInfo } from '../useNetworkInfo';
import { checkIsLimitedProvider, getStakeInfo } from './../../modules/dapp-staking/utils/index';
import { StakeInfo } from './../../store/dapp-staking/actions';
import { DappItem } from './../../store/dapp-staking/state';

export function useStakerInfo() {
  const { currentAccount } = useAccount();
  const { t } = useI18n();
  const store = useStore();

  const { currentNetworkName } = useNetworkInfo();

  store.dispatch('dapps/getStakingInfo');
  const stakeInfos = ref<StakeInfo[]>();
  const isLoading = computed(() => store.getters['general/isLoading']);
  const dapps = computed(() => store.getters['dapps/getAllDapps']);
  const isH160 = computed(() => store.getters['general/isH160Formatted']);

  const getData = async (address: string) => {
    return await getStakeInfo({
      api: $api!,
      dappAddress: address,
      currentAccount: currentAccount.value,
    });
  };

  const setStakeInfo = async () => {
    let data: StakeInfo[] = [];
    if (checkIsLimitedProvider()) {
      for await (let it of dapps.value) {
        const info = (await getData(it.address)) as StakeInfo;
        data.push(info);
      }
    } else {
      data = await Promise.all<StakeInfo>(
        dapps.value.map(async (it: DappItem) => {
          return await getData(it.address);
        })
      );
    }

    stakeInfos.value = data;
  };

  watchEffect(() => {
    if (currentNetworkName.value) {
      store.dispatch('dapps/getDapps', currentNetworkName.value);
    }
  });

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
