import { useStore } from 'src/store';
import { ref, watchEffect, computed } from 'vue';
import { GasPrice, fetchEvmGasPrice, SelectedGas, Speed } from './../../modules/gas-api';

const initialEvmGasPrice = {
  slow: 0,
  average: 0,
  fast: 0,
  baseFeePerGas: 0,
};

export const useGasPrice = () => {
  const selectedGas = ref<SelectedGas>({ speed: 'average', price: 0 });
  const evmGasPrice = ref<GasPrice>(initialEvmGasPrice);
  // Memo: Actual gas cost calculated by evmGasPrice and transaction data
  const evmGasCost = ref<GasPrice>(initialEvmGasPrice);

  const store = useStore();
  const isH160 = computed(() => store.getters['general/isH160Formatted']);
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

  const updateDefaultSelectedGasValue = (): void => {
    if (selectedGas.value.price === 0 && evmGasCost.value.average > 0) {
      setSelectedGas('average');
    }
  };

  const setEvmGasPrice = async (network: string): Promise<void> => {
    try {
      evmGasPrice.value = await fetchEvmGasPrice({ network, isEip1559: false });
    } catch (error) {
      console.error(error);
      evmGasPrice.value = initialEvmGasPrice;
    }
  };

  watchEffect(async () => {
    if (!network.value) return;
    if (isH160.value) {
      await setEvmGasPrice(network.value);
    }
  });

  watchEffect(async () => {
    if (!network.value || !isH160.value) return;
    updateDefaultSelectedGasValue();
  });

  return { evmGasPrice, selectedGas, setSelectedGas, evmGasCost };
};
