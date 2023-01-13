import { BN } from 'bn.js';
import { ethers } from 'ethers';
import { useAccount } from 'src/hooks';
import { useStore } from 'src/store';
import { StakeInfo } from 'src/store/dapp-staking/actions';
import { DappItem } from 'src/store/dapp-staking/state';
import { DappCombinedInfo } from 'src/v2/models/DappsStaking';
import { computed, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { container } from 'src/v2/common';
import { Symbols } from 'src/v2/symbols';
import { IDappStakingService } from 'src/v2/services';

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

  const setStakeInfo = async () => {
    let data: StakeInfo[] = [];
    let myData: MyStakeInfo[] = [];

    const dappStakingService = container.get<IDappStakingService>(Symbols.DappStakingService);
    data = await Promise.all<StakeInfo>(
      dapps.value.map(async (it: DappCombinedInfo) => {
        const stakeData = await dappStakingService.getStakeInfo(
          it.dapp?.address!,
          currentAccount.value
        );
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
    if (isLoading.value || !dapps.value || !currentAccount.value) {
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

  watch([currentAccount, myStakeInfos], setTotalStaked);

  return {
    stakeInfos,
    myStakeInfos,
    totalStaked,
    isLoadingTotalStaked,
  };
}
