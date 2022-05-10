import { useStore } from 'src/store';
import { ref, watchEffect, computed } from 'vue';
import { GasPrice, getEvmGasPrice } from './../../modules/gas-api';

const initialEvmGasPrice = {
  slow: 0,
  average: 0,
  fast: 0,
  baseFeePerGas: 0,
};

type Speed = 'slow' | 'average' | 'fast';

export const useGasPrice = () => {
  const evmGasPrice = ref<GasPrice>(initialEvmGasPrice);
  const selectedGasSpeed = ref<Speed>('average');
  const store = useStore();
  const isH160 = computed(() => store.getters['general/isH160Formatted']);

  const chainInfo = computed(() => {
    const chainInfo = store.getters['general/chainInfo'];
    return chainInfo ? chainInfo : {};
  });

  const network = computed(() => {
    const chainInfo = store.getters['general/chainInfo'];
    const network = chainInfo ? chainInfo.chain : '';
    return network === 'Shibuya Testnet' ? 'shibuya' : network.toLowerCase();
  });

  const setSelectedGasSpeed = (speed: Speed) => {
    selectedGasSpeed.value = speed;
  };

  const setEvmGasPrice = async (network: string): Promise<void> => {
    try {
      evmGasPrice.value = await getEvmGasPrice({ network, isEip1559: false });
    } catch (error) {
      console.error(error);
      evmGasPrice.value = initialEvmGasPrice;
    }
  };

  watchEffect(async () => {
    // const network = chainInfo.value.chain.toLowerCase();
    if (!network.value) return;
    if (isH160.value) {
      await setEvmGasPrice(network.value);
    }
  });

  watchEffect(() => {
    console.log('network', network.value);
    console.log('evmGasPrice', evmGasPrice.value);
    console.log('selectedGasSpeed', selectedGasSpeed.value);
  });

  return { evmGasPrice, selectedGasSpeed, setSelectedGasSpeed };
};
