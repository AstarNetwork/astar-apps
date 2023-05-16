import { Ledger } from '@polkadot/hw-ledger';
import { useAccount } from 'src/hooks/useAccount';
import { useStore } from 'src/store';
import { computed, ref, watch } from 'vue';

enum LedgerId {
  nanoS = 'nanoS',
  nanoSPlus = 'nanoSP',
  nanoX = 'nanoX',
}

export const useLedger = () => {
  const isLedgerAccount = ref<boolean>(false);
  const isLedgerNanoS = ref<boolean>(false);
  const ledger = ref<Ledger>();
  const ledgerAccount = ref<string>('');
  const { currentAccount } = useAccount();

  const store = useStore();
  const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);

  const handleReset = (): void => {
    isLedgerAccount.value = false;
    isLedgerNanoS.value = false;
    ledger.value = undefined;
    ledgerAccount.value = '';
  };

  const matchLedgerAccount = async (ledgerInstance: Ledger): Promise<string> => {
    // Memo: Polkadot.js supports importing from Ledger from 0-19 account types and indexes
    // Ref: https://gyazo.com/27b57e8a5f2c6bddaeb8e5b00180ba7b
    const pjsLedgerIndexes = Array.from({ length: 20 }, (_, index) => index); // [0, 1, 2, ..19]

    let found = false;
    let ledgerAddress = '';

    // Problem: it could be a time-consuming process if `accountType` is far from 0.
    // Memo: we can't use `await Promise.all` here due to Ledger's limitation
    for await (const accountType of pjsLedgerIndexes) {
      if (found) break;
      for await (const addressIndex of pjsLedgerIndexes) {
        const { address } = await ledgerInstance.getAddress(undefined, accountType, addressIndex);
        if (address === currentAccount.value) {
          ledgerAddress = address;
          found = true;
          break;
        }
      }
    }
    return ledgerAddress;
  };

  const handleLedgerData = async (): Promise<void> => {
    // Memo: make sure `transport` has been closed before creating ledger transport
    if (ledger.value && ledgerAccount.value) {
      const transport = (ledger.value as any).__internal__app.transport;
      transport.close();
    }

    if (!currentAccount.value || isH160.value) {
      handleReset();
      return;
    }
    try {
      if (!('hid' in window.navigator)) {
        console.error('WebHID API is not supported in this browser.');
        handleReset();
        return;
      }

      const hidDevices = (await (window.navigator as any).hid.getDevices()) as any;
      console.log('hidDevices', hidDevices);
      if (process.env.DEV) {
        console.info('hidDevices', hidDevices);
      }

      if (hidDevices.length === 0) {
        handleReset();
        return;
      }

      hidDevices.some(async (device: any) => {
        try {
          if (device?.productName?.toLowerCase().includes('nano')) {
            const ledgerData = new Ledger('hid', 'astar');

            if (process.env.DEV) {
              console.info('ledgerData', ledgerData);
            }

            ledgerAccount.value = await matchLedgerAccount(ledgerData);
            console.log('ledgerAccount.value', ledgerAccount.value);
            if (ledgerAccount.value) {
              ledger.value = ledgerData;
              const deviceModel = (ledgerData as any).__internal__app.transport.deviceModel;
              isLedgerAccount.value = true;
              isLedgerNanoS.value = deviceModel.id === LedgerId.nanoS;
              console.log('isLedgerAccount.value', isLedgerAccount.value);
              console.log('isLedgerNanoS.value', isLedgerNanoS.value);
            } else {
              handleReset();
            }
          }
        } catch (error: any) {
          const idLedgerLocked = '0x5515';
          if (error.message.includes(idLedgerLocked)) {
            store.dispatch('general/showAlertMsg', {
              msg: error.message,
              alertType: 'error',
            });
            handleReset();
          }
        } finally {
          return;
        }
      });
    } catch (error) {
      handleReset();
    }
  };

  watch([currentAccount], handleLedgerData, { immediate: true });

  return { isLedgerAccount, isLedgerNanoS };
};
