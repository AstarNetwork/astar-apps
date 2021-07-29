import { ref, onUnmounted, watch, Ref } from 'vue';
import { VoidFn } from '@polkadot/api/types';
import BN from 'bn.js';

function useCall(apiRef: any, addressRef: Ref<string>) {
  // should be fixed -- cannot refer it because it goes undefined once it called. to call balance again, it should pass apiRef by external params.
  // const { api: apiRef } = useApi();
  const balanceRef = ref(new BN(0));

  const unsub: Ref<VoidFn | undefined> = ref();

  watch(
    () => addressRef.value,
    (address) => {
      // console.log('addr', address);

      const api = apiRef?.value;
      if (unsub.value) {
        unsub.value();
        unsub.value = undefined;
      }
      if (address && api) {
        api.isReady.then(async () => {
          const {
            data: { free },
          } = await api.query.system.account(address);
          balanceRef.value = free.toBn();
          console.log(`The balances is ${free}`);
        });
      }
    },
    { immediate: true }
  );

  onUnmounted(() => {
    const unsubFn = unsub.value;
    if (unsubFn) {
      unsubFn();
    }
  });
  return {
    balanceRef,
  };
}

export function useBalance(apiRef: any, addressRef: Ref<string>) {
  const balance = ref(new BN(0));

  const { balanceRef } = useCall(apiRef, addressRef);

  watch(
    () => balanceRef?.value,
    (bal) => {
      if (bal) {
        balance.value = bal;
      }
    },
    { immediate: true }
  );

  return { balance };
}
