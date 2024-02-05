import { Ledger } from '@polkadot/hw-ledger';
import { useAccount } from 'src/hooks/useAccount';
import { useStore } from 'src/store';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

enum LedgerId {
  nanoS = 'nanoS',
  nanoSPlus = 'nanoSP',
  nanoX = 'nanoX',
}

export const useLedger = () => {
  const isLedgerNanoS = ref<boolean>(false);
  const ledger = ref<Ledger>();
  const ledgerAccount = ref<string>('');
  const { currentAccount } = useAccount();
  const { t } = useI18n();

  const store = useStore();
  const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
  const isLedger = computed<boolean>(() => store.getters['general/isLedger']);

  const handleReset = (): void => {
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
      if (!isLedger.value) return;
      const ledgerData = new Ledger('hid', 'astar');
      const { address } = await ledgerData.getAddress();
      if (process.env.DEV) {
        console.info('ledgerData', ledgerData);
      }

      if (address) {
        ledger.value = ledgerData;
        const deviceModel = (ledgerData as any).__internal__app.transport.deviceModel;
        ledgerAccount.value = address;
        isLedgerNanoS.value = deviceModel.id === LedgerId.nanoS;
      } else {
        handleReset();
      }
    } catch (error: any) {
      console.error(error);
      const idLedgerLocked = '0x5515';
      const idNotRunningApp = '28161';
      let errMsg = '';

      if (error.message.includes(idLedgerLocked)) {
        errMsg = error.message;
      } else if (error.message.includes(idNotRunningApp)) {
        errMsg = t('warning.ledgerNotOpened');
      }

      if (errMsg) {
        store.dispatch('general/showAlertMsg', {
          msg: errMsg,
          alertType: 'error',
        });
      }
      handleReset();
    }
  };

  watch([currentAccount], handleLedgerData, { immediate: true });

  return { isLedgerNanoS, isLedger };
};
