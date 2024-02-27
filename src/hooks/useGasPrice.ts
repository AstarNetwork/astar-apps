import { GasPrice, SelectedGas, Speed, fetchTipPrice } from '@astar-network/astar-sdk-core';
import { SupportWallet } from 'src/config/wallets';
import { useNetworkInfo } from 'src/hooks';
import { useStore } from 'src/store';
import { container } from 'src/v2/common';
import { IEventAggregator, TipPriceChangedMessage } from 'src/v2/messaging';
import { Symbols } from 'src/v2/symbols';
import { computed, ref, watch, watchEffect } from 'vue';

const initialGasPrice = {
  slow: '0',
  average: '0',
  fast: '0',
  baseFeePerGas: '0',
};

export const useGasPrice = (isFetch = false) => {
  const selectedTip = ref<SelectedGas>({ speed: 'average', price: '0' });
  const nativeTipPrice = ref<GasPrice>(initialGasPrice);

  const store = useStore();
  const gas = computed(() => store.getters['general/getGas']);
  const { currentNetworkName, isMainnet, isZkEvm } = useNetworkInfo();
  const network = computed<string>(() => {
    return isMainnet ? currentNetworkName.value.toLowerCase() : 'shibuya';
  });

  const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);

  const setSelectedTip = (speed: Speed): void => {
    selectedTip.value = {
      speed,
      price: nativeTipPrice.value[speed],
    };

    // Notify of tip price change.
    const eventAggregator = container.get<IEventAggregator>(Symbols.EventAggregator);
    eventAggregator.publish(new TipPriceChangedMessage(selectedTip.value));
  };

  const updateDefaultSelectedGasValue = (): void => {
    if (selectedTip.value.price === '0') {
      setSelectedTip('average');
    }
  };

  const setGasPrice = (): void => {
    if (!network.value || !gas.value) return;
    nativeTipPrice.value = gas.value.nativeTipPrice;
  };

  const dispatchGasPrice = async (network: string): Promise<void> => {
    try {
      // Todo: remove `evmGasPrice` object
      const result = await fetchTipPrice({
        network,
      });
      store.commit('general/setGas', result);
    } catch (error) {
      console.error(error);
    }
  };

  const isEnableSpeedConfiguration = computed<boolean>(() => {
    const currentWallet = store.getters['general/currentWallet'];
    return (
      currentWallet !== SupportWallet.TalismanEvm &&
      currentWallet !== SupportWallet.SubWalletEvm &&
      currentWallet !== SupportWallet.OneKeyEvm &&
      !isH160.value
    );
  });

  watch(
    [network],
    async () => {
      if (
        isFetch &&
        network.value &&
        !gas.value &&
        isEnableSpeedConfiguration.value &&
        !isZkEvm.value
      ) {
        // console.info('gas price', network.value, gas.value);
        await dispatchGasPrice(network.value);
      }
    },
    { immediate: true }
  );

  watchEffect(async () => {
    setGasPrice();
  });

  watchEffect(async () => {
    if (!network.value) return;
    updateDefaultSelectedGasValue();
  });

  return {
    selectedTip,
    nativeTipPrice,
    setSelectedTip,
    isEnableSpeedConfiguration,
  };
};
