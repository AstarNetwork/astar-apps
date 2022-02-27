import { useStore } from 'src/store';
import { computed, Ref, watch, ref } from 'vue';
import { contractInstance, Staking } from 'src/config/web3';
import dappsStakingContractAbi from 'src/config/web3/abi/dapps-staking-abi.json';
import { $web3 } from 'boot/api';
import { getDefaultEthProvider } from 'src/config/web3/utils';

export function useStaking(addressRef: Ref<string>) {
  const store = useStore();
  const isH160Formatted = computed(() => store.getters['general/isH160Formatted']);
  const stakingRef = ref();

  // dApps Staking precompiled contract address
  const PRECOMPILED_ADDR = '0x0000000000000000000000000000000000005001';

  watch(
    () => [$web3.value, addressRef.value],
    async () => {
      if ($web3.value && addressRef.value) {
        const ci = contractInstance(
          // $web3.value,
          getDefaultEthProvider(),
          dappsStakingContractAbi,
          PRECOMPILED_ADDR,
          addressRef.value
        );
        stakingRef.value = new Staking(ci, addressRef.value);
      }
    },
    { immediate: true }
  );

  const getEraInfo = () => {
    const result = ref();
    watch(
      () => stakingRef.value,
      async () => {
        if (stakingRef.value) {
          result.value = {
            currentEra: await stakingRef.value.getCurrentEra(),
            unbondingPeriod: await stakingRef.value.getUnbondingPeriod(),
          };
        }
      },
      { immediate: true }
    );

    return { result };
  };

  const getEraRewardsAndStakes = (era: number) => {
    const result = ref();
    watch(
      () => stakingRef.value,
      async () => {
        if (stakingRef.value) {
          result.value = {
            eraReward: await stakingRef.value.getEraReward(era),
            eraStaked: await stakingRef.value.getEraStaked(era),
          };
        }
      },
      { immediate: true }
    );

    return { result };
  };

  const getStakedAmount = (staker: string) => {
    const result = ref();
    watch(
      () => stakingRef.value,
      async () => {
        if (stakingRef.value) {
          result.value = {
            stakedAmount: await stakingRef.value.getStakedAmount(staker),
          };
        }
      },
      { immediate: true }
    );

    return { result };
  };

  const getContractStake = (contract_id: string) => {
    const result = ref();
    watch(
      () => stakingRef.value,
      async () => {
        if (stakingRef.value) {
          result.value = {
            stakedAmount: await stakingRef.value.getContractStake(contract_id),
          };
        }
      },
      { immediate: true }
    );

    return { result };
  };

  /* extrinsic calls */
  const handleError = (e: any) => {
    console.error(e);
    store.dispatch('general/showAlertMsg', {
      msg: `Transaction failed with error: ${e}`,
      alertType: 'error',
    });
  };

  const callRegister = async (contractAddr: string) => {
    let txHash;
    store.commit('general/setLoading', true);
    try {
      txHash = await stakingRef.value.callRegister(contractAddr);
      console.log('ss', txHash);
      store.dispatch('general/showAlertMsg', { msg: txHash, alertType: 'success' });
    } catch (e) {
      handleError(e);
    }
    store.commit('general/setLoading', false);
    return txHash;
  };

  const callBondAndStake = async (contractAddr: string, amount: number) => {
    let txHash;
    store.commit('general/setLoading', true);
    try {
      txHash = await stakingRef.value.callBondAndStake(contractAddr, amount);
      store.dispatch('general/showAlertMsg', { msg: txHash, alertType: 'success' });
    } catch (e) {
      handleError(e);
    }
    store.commit('general/setLoading', false);
    return txHash;
  };

  const callUnbondAndUnstake = async (contractAddr: string, amount: number) => {
    let txHash;
    store.commit('general/setLoading', true);
    try {
      txHash = await stakingRef.value.callUnbondAndUnstake(contractAddr, amount);
      store.dispatch('general/showAlertMsg', { msg: txHash, alertType: 'success' });
    } catch (e) {
      handleError(e);
    }
    store.commit('general/setLoading', false);
    return txHash;
  };

  const callWithdrawUnbonded = async () => {
    let txHash;
    store.commit('general/setLoading', true);
    try {
      txHash = await stakingRef.value.callWithdrawUnbonded();
      store.dispatch('general/showAlertMsg', { msg: txHash, alertType: 'success' });
    } catch (e) {
      handleError(e);
    }
    store.commit('general/setLoading', false);
    return txHash;
  };

  const callClaim = async (contractAddr: string, amount: number) => {
    let txHash;
    store.commit('general/setLoading', true);
    try {
      txHash = await stakingRef.value.callClaim(contractAddr, amount);
      store.dispatch('general/showAlertMsg', { msg: txHash, alertType: 'success' });
    } catch (e) {
      handleError(e);
    }
    store.commit('general/setLoading', false);
    return txHash;
  };

  return {
    getEraInfo,
    getEraRewardsAndStakes,
    getStakedAmount,
    getContractStake,
    callRegister,
    callBondAndStake,
    callUnbondAndUnstake,
    callWithdrawUnbonded,
    callClaim,
  };
}
