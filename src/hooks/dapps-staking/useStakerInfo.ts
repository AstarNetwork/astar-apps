import { BN } from 'bn.js';
import { $api } from 'boot/api';
import { ethers } from 'ethers';
import { useAccount } from 'src/hooks';
import { getStakeInfo } from 'src/modules/dapp-staking/utils/index';
import { useStore } from 'src/store';
import { StakeInfo } from 'src/store/dapp-staking/actions';
import { DappItem } from 'src/store/dapp-staking/state';
import { DappCombinedInfo } from 'src/v2/models/DappsStaking';
import { computed, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

export type MyStakeInfo = StakeInfo | DappItem;

export function useStakerInfo() {
  const { currentAccount } = useAccount();
  const { t } = useI18n();
  const store = useStore();

  store.dispatch('dapps/getStakingInfo');
  const isLoadingTotalStaked = ref<boolean>(true);
  const totalStaked = ref<string>('0');
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

    data = await Promise.all<StakeInfo>(
      dapps.value.map(async (it: DappCombinedInfo) => {
        const stakeData = await getData(it.dapp?.address!);
        if (stakeData?.hasStake) {
          myData.push({ ...stakeData, ...it.dapp });
        }
        return stakeData;
      })
    );

    stakeInfos.value = data;
    myStakeInfos.value = myData;
  };

  const setTotalStaked = (): void => {
    isLoadingTotalStaked.value = true;
    if (myStakeInfos.value && !isLoading.value) {
      let ttl = new BN('0');
      myStakeInfos.value.forEach((it) => {
        ttl = ttl.add(it.yourStake.denomAmount);
      });
      totalStaked.value = ethers.utils.formatEther(ttl.toString());
      isLoadingTotalStaked.value = false;
    }
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

  watch([currentAccount, myStakeInfos], setTotalStaked);

  return {
    stakeInfos,
    myStakeInfos,
    totalStaked,
    isLoadingTotalStaked,
  };
}
