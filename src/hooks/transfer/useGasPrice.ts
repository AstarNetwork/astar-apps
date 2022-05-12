import { $web3 } from 'boot/api';
import { useStore } from 'src/store';
import { ref, watchEffect, computed } from 'vue';
import { GasPrice, fetchEvmGasPrice, SelectedGas, Speed } from './../../modules/gas-api';

const initialGasPrice = {
  slow: 0,
  average: 0,
  fast: 0,
  baseFeePerGas: 0,
};

export const useGasPrice = () => {
  const selectedGas = ref<SelectedGas>({ speed: 'average', price: 0 });
  const selectedTips = ref<SelectedGas>({ speed: 'average', price: 0 });
  const evmGasPrice = ref<GasPrice>(initialGasPrice);
  const nativeTipsPrice = ref<GasPrice>(initialGasPrice);

  // Memo: Actual gas cost calculated by evmGasPrice and transaction data
  const evmGasCost = ref<GasPrice>(initialGasPrice);

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

  const setSelectedTips = (speed: Speed): void => {
    selectedTips.value = {
      speed,
      price: nativeTipsPrice.value[speed],
    };
  };

  const updateDefaultSelectedGasValue = (): void => {
    if (selectedGas.value.price === 0 && evmGasCost.value.average > 0) {
      setSelectedGas('average');
    }
    console.log('nativeTipsPrice.value.average', nativeTipsPrice.value.average);
    if (selectedTips.value.price === 0 && nativeTipsPrice.value.average > 0) {
      setSelectedTips('average');
    }
  };

  const setGasPrice = async (network: string): Promise<void> => {
    try {
      const result = await fetchEvmGasPrice({
        network,
        isEip1559: false,
        web3: $web3.value!,
      });
      evmGasPrice.value = result.evmGasPrice;
      nativeTipsPrice.value = result.nativeTipsPrice;
      console.log('nativeTipsPrice.value', nativeTipsPrice.value);
    } catch (error) {
      console.error(error);
      evmGasPrice.value = initialGasPrice;
      nativeTipsPrice.value = initialGasPrice;
    }
  };

  watchEffect(async () => {
    if (!network.value) return;
    await setGasPrice(network.value);
  });

  watchEffect(async () => {
    if (!network.value) return;
    updateDefaultSelectedGasValue();
  });

  watchEffect(async () => {
    console.log('selectedTips.value.price', selectedTips.value.price);
  });

  return {
    evmGasPrice,
    selectedGas,
    setSelectedGas,
    evmGasCost,
    selectedTips,
    nativeTipsPrice,
    setSelectedTips,
  };
};
