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
  const { currentAccount } = useAccount();

  const store = useStore();
  const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);

  const handleReset = (): void => {
    isLedgerAccount.value = false;
    isLedgerNanoS.value = false;
  };

  const handleLedgerData = async (): Promise<void> => {
    if (!currentAccount.value || currentAccount.value === null || isH160.value) {
      handleReset();
      return;
    }
    try {
      const ledger = new Ledger('hid', 'astar');
      const { address } = await ledger.getAddress();
      const deviceModel = (ledger as any).__internal__app.transport.deviceModel;
      isLedgerAccount.value = address === currentAccount.value;
      isLedgerNanoS.value = deviceModel.id === LedgerId.nanoS;
    } catch (error) {
      handleReset();
    }
  };

  watch([currentAccount], handleLedgerData, { immediate: true });

  return { isLedgerAccount, isLedgerNanoS };
};
