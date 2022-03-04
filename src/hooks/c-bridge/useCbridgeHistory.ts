import { getHistory, History, pendingStatus } from 'src/c-bridge';
import { useStore } from 'src/store';
import { computed, onUnmounted, ref, watchEffect } from 'vue';

export function useCbridgeHistory() {
  const histories = ref<History[] | []>([]);
  const isPendingTx = ref<boolean>(false);
  const isUpdatingHistories = ref<boolean>(false);

  const store = useStore();
  const isH160 = computed(() => store.getters['general/isH160Formatted']);
  const selectedAddress = computed(() => store.getters['general/selectedAddress']);

  const fetchHistory = async (): Promise<void> => {
    if (!isH160.value || !selectedAddress.value) return;

    const { histories: historyArray, isPending } = await getHistory(selectedAddress.value);

    if (histories.value.length === 0) {
      histories.value = historyArray;
      isPendingTx.value = isPending;
    }

    if (histories.value.length === 0) return;

    const isFirstItemPending = pendingStatus.find((it) => it === histories.value[0].status);
    // Memo: update history items on the modal UI
    if (isFirstItemPending || isPending) {
      isUpdatingHistories.value = true;
      histories.value = [];
      const { histories: historyArray, isPending } = await getHistory(selectedAddress.value);
      histories.value = historyArray;
      isPendingTx.value = isPending;
      setTimeout(() => {
        isUpdatingHistories.value = false;
      }, 500);
    }
  };

  watchEffect(async () => {
    if (selectedAddress.value) {
      await fetchHistory();
    } else {
      histories.value = [];
    }
  });

  const handleUpdate = setInterval(async () => {
    await fetchHistory();
  }, 30 * 1000);

  onUnmounted(() => {
    clearInterval(handleUpdate);
  });

  return {
    histories,
    isUpdatingHistories,
    isPendingTx,
  };
}
