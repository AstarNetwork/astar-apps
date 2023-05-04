import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import { Ledger } from '@polkadot/hw-ledger';
import { useStore } from 'src/store';
import { computed, ref, watch } from 'vue';

export const useLedger = () => {
  const isLedgerAccount = ref<boolean>(false);
  const isLedgerNanoS = ref<boolean>(false);

  const store = useStore();
  const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
  const currentAddress = computed<string>(() => store.getters['general/selectedAddress']);

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
      console.log('handleLedgerData');
      const ledger = new Ledger('hid', 'astar');
      console.log('ledger', ledger);
      const { address } = await ledger.getAddress();
      console.log('address', address);
      // const transport = await TransportWebUSB.create();
      const internalApp = (ledger as any).__internal__app;
      console.log('internalApp', internalApp);
      const transport = internalApp.transport;
      console.log('transport', transport);
      const deviceModel = transport.deviceModel;
      console.log('deviceModel', deviceModel);
      const model = deviceModel?.productName.toLowerCase().replace(/\u00A0/g, ' ') || '';
      // await transport.close();
      isLedgerAccount.value = address === currentAddress.value;
      isLedgerNanoS.value = !!model.includes('nano s');
      console.log('isLedgerAccount.value', isLedgerAccount.value);
      console.log('isLedgerNanoS.value', isLedgerNanoS.value);
    } catch (error) {
      console.error(error);
      handleReset();
    }
  };

  watch([currentAddress], handleLedgerData, { immediate: false });

  return { isLedgerAccount, isLedgerNanoS };
};
