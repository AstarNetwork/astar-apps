import { useStore } from 'src/store';
import { Ref, watch, ref } from 'vue';
import { contractInstance, XCM } from 'src/config/web3';
import xcmContractAbi from 'src/config/web3/abi/xcm-abi.json';
import { $web3 } from 'boot/api';
import BN from 'bn.js';

export function useXcmEvm(addressRef: Ref<string>) {
  const store = useStore();
  const xcmRef = ref();

  // dApps Staking precompiled contract address
  const PRECOMPILED_ADDR = '0x0000000000000000000000000000000000005001';

  watch(
    () => [$web3.value, addressRef.value],
    async () => {
      if ($web3.value && addressRef.value) {
        const ci = contractInstance(
          $web3.value!!,
          xcmContractAbi,
          PRECOMPILED_ADDR,
          addressRef.value
        );
        xcmRef.value = new XCM(ci, addressRef.value);
      }
    },
    { immediate: true }
  );

  /* extrinsic calls */
  const handleError = (e: any) => {
    console.error(e);
    store.dispatch('general/showAlertMsg', {
      msg: `Transaction failed with error: ${e}`,
      alertType: 'error',
    });
  };

  const callAssetWithdrawToPara = async (
    asset_id: string,
    asset_amount: BN,
    recipient_account_id: string
  ) => {
    store.commit('general/setLoading', true);
    try {
      let txHash = await xcmRef.value.callAssetsWithdraw(
        [asset_id],
        [asset_amount],
        recipient_account_id,
        true,
        0,
        0
      );

      console.log('txHAsh', txHash);
      return txHash;
    } catch (e) {
      handleError(e);
    }
    store.commit('general/setLoading', false);
    return null;
  };

  return {
    callAssetWithdrawToPara,
  };
}
