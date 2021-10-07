import { ref, onUnmounted, watch, Ref } from 'vue';
import { VoidFn } from '@polkadot/api/types';
import BN from 'bn.js';
import { AccountInfo, Balance } from '@polkadot/types/interfaces';

function useCall(apiRef: any, addressRef: Ref<string>) {
  // should be fixed -- cannot refer it because it goes undefined once it called. to call balance again, it should pass apiRef by external params.
  // const { api: apiRef } = useApi();
  const balanceRef = ref(new BN(0));
  const accountDataRef = ref<AccountData>();

  const unsub: Ref<VoidFn | undefined> = ref();

  watch(
    () => addressRef.value,
    (address) => {
      const api = apiRef?.value;
      if (unsub.value) {
        unsub.value();
        unsub.value = undefined;
      }
      if (address && api) {
        api.isReady.then(async () => {
          const accountInfo: AccountInfo = await api.query.system.account(address);
          accountDataRef.value = new AccountData(
            accountInfo.data.free,
            accountInfo.data.reserved,
            accountInfo.data.miscFrozen,
            accountInfo.data.feeFrozen);  
          
          balanceRef.value = accountInfo.data.free.toBn();
          console.log(`The balance is ${balanceRef.value}`, accountDataRef.value  );
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
    accountDataRef
  };
}

export function useBalance(apiRef: any, addressRef: Ref<string>) {
  const balance = ref(new BN(0));
  const accountData = ref<AccountData>();

  const { balanceRef, accountDataRef } = useCall(apiRef, addressRef);

  watch(
    () => balanceRef?.value,
    (bal) => {
      if (bal) {
        balance.value = bal;
      }
    },
    { immediate: true }
  );

  watch(
    () => accountDataRef?.value,
    (info) => {
      if (info) {
        accountData.value = info;
      }
    },
    { immediate: true }
  );

  return { balance, accountData };
}

export class AccountData {
  constructor(free: Balance, reserved: Balance, miscFrozen: Balance, feeFrozen: Balance) {
    this.free = free.toBn();
    this.reserved = reserved.toBn();
    this.miscFrozen = miscFrozen.toBn();
    this.feeFrozen = feeFrozen.toBn();
  }

  public getUsableTransactionBalance(): BN {
    return this.free.sub(this.miscFrozen);
  }

  public getUsableFeeBalance(): BN {
    return this.free.sub(this.feeFrozen);
  }

  public free: BN;
  public reserved: BN;
  public miscFrozen: BN;
  public feeFrozen: BN;
}
