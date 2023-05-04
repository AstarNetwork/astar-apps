import { Ledger } from '@polkadot/hw-ledger';
import { useAccount } from 'src/hooks/useAccount';
import { useStore } from 'src/store';
import { computed, ref, watch } from 'vue';

export const useLedger = () => {
  const isLedgerAccount = ref<boolean>(false);
  const isLedgerNanoS = ref<boolean>(false);
  const { currentAccount } = useAccount();

  const store = useStore();
  const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);

  const handleReset = () => {
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
      console.log('deviceModel', deviceModel);
      isLedgerAccount.value = address === currentAccount.value;
      isLedgerNanoS.value = deviceModel.id === 'nanoS';
      console.log('isLedgerAccount.value', isLedgerAccount.value);
      console.log('isLedgerNanoS.value', isLedgerNanoS.value);
    } catch (error) {
      handleReset();
    }
  };

  watch([currentAccount], handleLedgerData, { immediate: true });

  return { isLedgerAccount, isLedgerNanoS };
};
