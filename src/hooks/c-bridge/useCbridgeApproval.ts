import { MaxUint256 } from '@ethersproject/constants';
import { approve, getTokenInfo } from 'src/c-bridge';
import ABI from 'src/c-bridge/abi/ERC20.json';
import { useStore } from 'src/store';
import { nativeCurrency } from 'src/web3';
import { computed, ref, watchEffect, watch } from 'vue';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { getEvmProvider } from '../helper/wallet';

export function useCbridgeApproval() {
  const isApprovalNeeded = ref<boolean>(true);
  const selectedNetwork = ref<number>(0);
  const store = useStore();
  const selectedAddress = computed(() => store.getters['general/selectedAddress']);
  const isH160 = computed(() => store.getters['general/isH160Formatted']);
  const selectedToken = computed(() => store.getters['bridge/selectedToken']);

  const handleApprove = async (): Promise<void> => {
    try {
      const provider = getEvmProvider();
      if (!selectedToken.value || !selectedNetwork.value || !provider) return;
      if (selectedNetwork.value !== selectedNetwork.value) {
        throw Error('invalid network');
      }

      const hash = await approve({
        address: selectedAddress.value,
        selectedToken: selectedToken.value,
        srcChainId: selectedNetwork.value,
        provider,
      });
      const msg = `Transaction submitted at transaction hash #${hash}`;
      store.dispatch('general/showAlertMsg', { msg, alertType: 'success' });
    } catch (error: any) {
      console.error(error.message);
      store.dispatch('general/showAlertMsg', {
        msg: error.message || 'Something went wrong',
        alertType: 'error',
      });
    }
  };

  watchEffect(() => {
    let cancelled = false;
    const provider = getEvmProvider();
    if (
      !isH160.value ||
      !selectedNetwork.value ||
      !selectedToken.value ||
      !selectedAddress.value ||
      !provider
    ) {
      return;
    }

    const address = selectedAddress.value;
    const { tokenAddress, symbol, contractAddress } = getTokenInfo({
      srcChainId: selectedNetwork.value,
      selectedToken: selectedToken.value,
    });

    const checkIsApproved = async (): Promise<boolean | null> => {
      if (!tokenAddress) return null;
      if (!tokenAddress || !symbol || !contractAddress) {
        throw Error('Cannot find token information');
      }
      const web3 = new Web3(provider as any);
      const contract = new web3.eth.Contract(ABI as AbiItem[], tokenAddress);
      const allowance = await contract.methods
        .allowance(address, contractAddress)
        .call()
        .catch((error: any) => {
          return '0';
        });
      return Number(allowance) === Number(MaxUint256.toString());
    };

    const checkPeriodically = async () => {
      if (cancelled || !selectedNetwork.value || isApprovalNeeded.value === false) return;
      isApprovalNeeded.value = true;
      if (nativeCurrency[selectedNetwork.value].name === symbol) {
        isApprovalNeeded.value = false;
        return;
      }

      const result = await checkIsApproved();
      if (cancelled) return;
      isApprovalNeeded.value = !!!result;
      setTimeout(checkPeriodically, 15000);
    };

    checkPeriodically();

    return () => {
      cancelled = true;
    };
  });

  watchEffect(async () => {
    const provider = getEvmProvider();
    if (!isH160.value || !provider) return;

    const web3 = new Web3(provider as any);
    const chainId = await web3.eth.getChainId();
    selectedNetwork.value = chainId;

    provider &&
      provider.on('chainChanged', (chainId: string) => {
        selectedNetwork.value = Number(chainId);
        isApprovalNeeded.value = true;
      });
  });

  watch(
    [selectedToken],
    () => {
      isApprovalNeeded.value = true;
    },
    { immediate: false }
  );

  return {
    isApprovalNeeded,
    handleApprove,
  };
}
