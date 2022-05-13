import { $web3 } from 'boot/api';
import { useStore } from 'src/store';
import { ref, watchEffect, computed, watch } from 'vue';
import { GasPrice, fetchEvmGasPrice, SelectedGas, Speed } from '../modules/gas-api';

const initialGasPrice = {
  slow: '0',
  average: '0',
  fast: '0',
  baseFeePerGas: '0',
};

export const useGasPrice = (isFetch = false) => {
  const selectedGas = ref<SelectedGas>({ speed: 'average', price: '0' });
  const selectedTip = ref<SelectedGas>({ speed: 'average', price: '0' });
  const evmGasPrice = ref<GasPrice>(initialGasPrice);
  const nativeTipPrice = ref<GasPrice>(initialGasPrice);

  // Memo: Actual gas cost calculated by evmGasPrice and transaction data
  const evmGasCost = ref<GasPrice>(initialGasPrice);

  const store = useStore();
  const gas = computed(() => store.getters['general/getGas']);
  const network = computed<string>(() => {
    const chainInfo = store.getters['general/chainInfo'];
    const network = chainInfo ? chainInfo.chain : '';
    return network === 'Shibuya Testnet' ? 'shibuya' : network.toLowerCase();
  });

  const setSelectedGas = (speed: Speed): void => {
    selectedGas.value = {
      speed,
      price: evmGasPrice.value[speed],
    };
  };

  const setSelectedTip = (speed: Speed): void => {
    selectedTip.value = {
      speed,
      price: nativeTipPrice.value[speed],
    };
  };

  const updateDefaultSelectedGasValue = (): void => {
    if (selectedGas.value.price === '0') {
      setSelectedGas('average');
    }
    if (selectedTip.value.price === '0') {
      setSelectedTip('average');
    }
  };

  const setGasPrice = (): void => {
    if (!network.value || !gas.value) return;
    evmGasPrice.value = gas.value.evmGasPrice;
    nativeTipPrice.value = gas.value.nativeTipPrice;
  };

  const dispatchGasPrice = async (network: string): Promise<void> => {
    try {
      const result = await fetchEvmGasPrice({
        network,
        isEip1559: false,
        web3: $web3.value!,
      });
      store.commit('general/setGas', result);
    } catch (error) {
      console.log(error);
    }
  };

  watch(
    [network, $web3],
    async () => {
      if (isFetch && network.value && !gas.value && $web3.value) {
        await dispatchGasPrice(network.value);
      }
    },
    { immediate: false }
  );

  watchEffect(async () => {
    setGasPrice();
  });

  watchEffect(async () => {
    if (!network.value) return;
    updateDefaultSelectedGasValue();
  });

  return {
    evmGasPrice,
    selectedGas,
    setSelectedGas,
    evmGasCost,
    selectedTip,
    nativeTipPrice,
    setSelectedTip,
  };
};
