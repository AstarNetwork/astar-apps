import { VoidFn } from '@polkadot/api/types';
import { Balance } from '@polkadot/types/interfaces';
import BN from 'bn.js';
import { useStore } from 'src/store';
import { createWeb3Instance } from 'src/web3';
import { computed, onUnmounted, ref, Ref, watch } from 'vue';
import { getVested } from './helper/vested';

function useCall(apiRef: any, addressRef: Ref<string>) {
  // should be fixed -- cannot refer it because it goes undefined once it called. to call balance again, it should pass apiRef by external params.
  // const { api: apiRef } = useApi();
  const balanceRef = ref(new BN(0));
  const vestedRef = ref(new BN(0));
  const accountDataRef = ref<AccountData>();
  const store = useStore();
  const isH160Formatted = computed(() => store.getters['general/isH160Formatted']);
  const currentNetworkIdx = computed(() => store.getters['general/networkIdx']);
  const isLoading = computed(() => store.getters['general/isLoading']);
  const dapps = computed(() => store.getters['dapps/getAllDapps']);

  const unsub: Ref<VoidFn | undefined> = ref();

  const updateAccountH160 = async (address: string) => {
    if (!address) return;
    try {
      const web3 = await createWeb3Instance(currentNetworkIdx.value);
      if (!web3) {
        throw Error(`cannot create the web3 instance with network id ${currentNetworkIdx.value}`);
      }

      const rawBal = await web3.eth.getBalance(address);
      accountDataRef.value = new AccountDataH160(
        new BN(rawBal),
        new BN(0),
        new BN(0),
        new BN(0),
        new BN(0)
      );
      balanceRef.value = new BN(rawBal);
    } catch (error) {
      console.error(error);
    }
  };

  const updateAccount = (address: string) => {
    if (!address) return;

    const api = apiRef?.value;
    if (unsub.value) {
      unsub.value();
      unsub.value = undefined;
    }
    if (!api) return;

    api.isReady.then(async () => {
      const results = await Promise.all([
        api.query.system.account(address),
        api.query.vesting.vesting(address),
        api.query.system.number(),
      ]);

      const accountInfo = results[0];

      const vesting = results[1];
      const currentBlock = results[2];
      const vestingValue = vesting.value;
      const vestingLocked = vestingValue.locked;

      vestedRef.value = vestingLocked
        ? getVested({
            currentBlock: currentBlock.toBn(),
            startBlock: vesting.value.startingBlock.toBn(),
            perBlock: vesting.value.perBlock.toBn(),
          })
        : new BN(0);

      accountDataRef.value = new AccountData(
        accountInfo.data.free,
        accountInfo.data.reserved,
        accountInfo.data.miscFrozen,
        accountInfo.data.feeFrozen,
        vestedRef.value
      );

      balanceRef.value = accountInfo.data.free.toBn();
    });
  };

  const updateAccountBalance = () => {
    const address = addressRef.value;
    if (isH160Formatted.value) {
      updateAccountH160(address);
    } else {
      updateAccount(address);
    }
  };

  const updateAccountHandler = setInterval(() => {
    updateAccountBalance();
  }, 12000);

  watch(
    [addressRef, isLoading, dapps],
    () => {
      updateAccountBalance();
    },
    { immediate: true }
  );

  onUnmounted(() => {
    clearInterval(updateAccountHandler);
    const unsubFn = unsub.value;
    if (unsubFn) {
      unsubFn();
    }
  });
  return {
    balanceRef,
    accountDataRef,
  };
}

export function useBalance(apiRef: any, addressRef: Ref<string>) {
  const balance = ref(new BN(0));
  const accountData = ref<AccountData | AccountDataH160>();

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
  constructor(
    free: Balance,
    reserved: Balance,
    miscFrozen: Balance,
    feeFrozen: Balance,
    vested: BN
  ) {
    this.free = free.toBn();
    this.reserved = reserved.toBn();
    this.miscFrozen = miscFrozen.toBn();
    this.feeFrozen = feeFrozen.toBn();
    this.vested = vested;
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
  public vested: BN;
}
export class AccountDataH160 {
  constructor(
    public free: BN,
    public reserved: BN,
    public miscFrozen: BN,
    public feeFrozen: BN,
    public vested: BN
  ) {}

  public getUsableTransactionBalance(): BN {
    return this.free.sub(this.miscFrozen);
  }

  public getUsableFeeBalance(): BN {
    return this.free.sub(this.feeFrozen);
  }
}
