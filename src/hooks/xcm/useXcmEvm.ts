import { useStore } from 'src/store';
import { Ref, watch, ref } from 'vue';
import { contractInstance, XCM } from 'src/config/web3';
import xcmContractAbi from 'src/config/web3/abi/xcm-abi.json';
import { ethers } from 'ethers';
import BN from 'bn.js';
import Web3 from 'web3';
import { decodeAddress } from '@polkadot/util-crypto';
import { getPubkeyFromSS58Addr } from 'src/hooks/helper/addressUtils';
import { buildEvmAddress } from 'src/config/web3/utils/convert';
import { getEvmProvider } from 'src/hooks/helper/wallet';

export function useXcmEvm(addressRef: Ref<string>) {
  const store = useStore();
  const xcmRef = ref();

  // xcm precompiled contract address
  const PRECOMPILED_ADDR = '0x0000000000000000000000000000000000005004';

  watch(
    () => [addressRef.value],
    async () => {
      if (addressRef.value) {
        const provider = getEvmProvider();
        const web3 = new Web3(provider as any);
        const ci = contractInstance(web3, xcmContractAbi, PRECOMPILED_ADDR, addressRef.value);
        xcmRef.value = new XCM(ci, addressRef.value);
      }
    },
    { immediate: true }
  );

  /* extrinsic calls */
  const handleError = (e: any) => {
    console.error(e);
    store.commit('general/setLoading', false);
    store.dispatch('general/showAlertMsg', {
      msg: `Transaction failed with error: ${e}`,
      alertType: 'error',
    });
  };

  const callAssetWithdrawToPara = async (
    asset_id: string,
    asset_amount: string,
    recipient_account_id: string,
    decimals: number,
    finalizedCallback: () => Promise<void>
  ) => {
    store.commit('general/setLoading', true);

    const assetAmount = ethers.utils.parseUnits(asset_amount, decimals).toString();
    console.log('amount', assetAmount);
    const recipientEvmAccountId = buildEvmAddress(recipient_account_id);
    console.log('recipient', recipientEvmAccountId);
    try {
      const txHash = await xcmRef.value.callAssetsWithdraw(
        [asset_id],
        [new BN(assetAmount)],
        recipientEvmAccountId,
        true,
        0,
        0,
        finalizedCallback
      );

      console.log('txHash', txHash);
      store.commit('general/setLoading', false);
      return txHash;
    } catch (e) {
      handleError(e);
    }
    return null;
  };

  return {
    callAssetWithdrawToPara,
  };
}
