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
            const { address } = await ledgerData.getAddress();
            if (process.env.DEV) {
              console.info('ledgerData', ledgerData);
            }

            if (address) {
              ledger.value = ledgerData;
              const deviceModel = (ledgerData as any).__internal__app.transport.deviceModel;
              ledgerAccount.value = address;
              isLedgerAccount.value = address === currentAccount.value;
              isLedgerNanoS.value = deviceModel.id === LedgerId.nanoS;
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
