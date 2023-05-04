import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import { Ledger } from '@polkadot/hw-ledger';
import { useStore } from 'src/store';
import { computed, ref, watch } from 'vue';

export const useLedger = () => {
  const isLedgerAccount = ref<boolean>(false);
  const isLedgerNanoS = ref<boolean>(false);

  const store = useStore();
  const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
  const currentAddress = computed(() => store.getters['general/selectedAddress']);

  const handleReset = () => {
    isLedgerAccount.value = false;
    isLedgerNanoS.value = false;
  };

  const handleLedgerData = async (): Promise<void> => {
    if (currentAddress.value === null || isH160.value) {
      handleReset();
      return;
    }
    try {
      const ledger = new Ledger('hid', 'astar');
      const { address } = await ledger.getAddress();
      const transport = await TransportWebUSB.create();
      const model = transport.deviceModel?.productName.toLowerCase().replace(/\u00A0/g, ' ') || '';
      await transport.close();
      isLedgerAccount.value = address === currentAddress.value;
      isLedgerNanoS.value = !!model.includes('nano s');
    } catch (error) {
      handleReset();
    }
  };

  watch([currentAddress], handleLedgerData, { immediate: false });

  return { isLedgerAccount, isLedgerNanoS };
};
