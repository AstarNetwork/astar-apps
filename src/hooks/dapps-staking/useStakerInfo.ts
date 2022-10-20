import { $api } from 'boot/api';
import { useStore } from 'src/store';
import { computed, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { useNetworkInfo, useAccount } from 'src/hooks';
import { checkIsLimitedProvider, getStakeInfo } from 'src/modules/dapp-staking/utils/index';
import { StakeInfo } from 'src/store/dapp-staking/actions';
import { DappItem } from 'src/store/dapp-staking/state';
import { DappCombinedInfo } from 'src/v2/models/DappsStaking';

export type MyStakeInfo = StakeInfo | DappItem;

export function useStakerInfo() {
  const { currentAccount } = useAccount();
  const { t } = useI18n();
  const store = useStore();

  const { currentNetworkName } = useNetworkInfo();

  store.dispatch('dapps/getStakingInfo');
  const stakeInfos = ref<StakeInfo[]>();
  const myStakeInfos = ref<MyStakeInfo[]>();
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
    let myData: MyStakeInfo[] = [];
    if (checkIsLimitedProvider()) {
      for await (let it of dapps.value) {
        const info = (await getData(it.dapp?.address)) as StakeInfo;
        data.push(info);
      }
    } else {
      data = await Promise.all<StakeInfo>(
        dapps.value.map(async (it: DappCombinedInfo) => {
          const stakeData = await getData(it.dapp?.address!);
          if (stakeData?.hasStake) {
            myData.push({ ...stakeData, ...it.dapp });
          }
          return stakeData;
        })
      );
    }

    stakeInfos.value = data;
    myStakeInfos.value = myData;
  };

  watchEffect(() => {
    // if (currentNetworkName.value) {
    //   store.dispatch('dapps/getDapps', {
    //     network: currentNetworkName.value,
    //     currentAccount: currentAccount.value,
    //   });
    // }
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
    myStakeInfos,
  };
}
