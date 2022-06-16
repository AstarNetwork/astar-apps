import { useStore } from 'src/store';
import { useI18n } from 'vue-i18n';
import { Ref, watch, ref, computed } from 'vue';
import { contractInstance, XCM } from 'src/config/web3';
import xcmContractAbi from 'src/config/web3/abi/xcm-abi.json';
import { ethers } from 'ethers';
import BN from 'bn.js';
import Web3 from 'web3';
import { endpointKey, getProviderIndex } from 'src/config/chainEndpoints';
import { isValidAddressPolkadotAddress } from 'src/hooks/helper/plasmUtils';
import { buildEvmAddress } from 'src/config/web3/utils/convert';
import { getEvmProvider } from 'src/hooks/helper/wallet';
import { DOT, KSM } from 'src/modules/token';

export function useXcmEvm(addressRef: Ref<string>) {
  const store = useStore();
  const xcmRef = ref();
  const { t } = useI18n();

  // xcm precompiled contract address
  const PRECOMPILED_ADDR = '0x0000000000000000000000000000000000005004';

  const currentNetworkIdx = computed(() => {
    const chainInfo = store.getters['general/chainInfo'];
    const chain = chainInfo ? chainInfo.chain : '';
    return getProviderIndex(chain);
  });
  const isAstar = computed(() => currentNetworkIdx.value === endpointKey.ASTAR);

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
    asset_amount: string,
    recipient_account_id: string,
    finalizedCallback: () => Promise<void>
  ) => {
    if (!asset_amount) {
      throw Error('Invalid amount');
    }

    if (!isValidAddressPolkadotAddress(recipient_account_id)) {
      throw Error('Invalid destination address');
    }

    store.commit('general/setLoading', true);

    // TODO: need refactor as more scalable later
    let asset_id = KSM.address;
    let decimal = KSM.decimal;
    if (isAstar) {
      asset_id = DOT.address;
      decimal = DOT.decimal;
    }

    const assetAmount = ethers.utils.parseUnits(asset_amount, decimal).toString();
    // console.log('amount', assetAmount);
    const recipientEvmAccountId = buildEvmAddress(recipient_account_id);

    try {
      const txHash: string = await xcmRef.value.callAssetsWithdraw(
        [asset_id],
        [new BN(assetAmount)],
        recipientEvmAccountId,
        true,
        0,
        0,
        finalizedCallback
      );

      // console.log('txHash', txHash);
      store.commit('general/setLoading', false);
      store.dispatch('general/showAlertMsg', {
        msg: t('toast.completedHash', { hash: txHash }),
        alertType: 'success',
      });
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
