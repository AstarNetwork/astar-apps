import { VoidFn } from '@polkadot/api/types';
import { Balance } from '@polkadot/types/interfaces';
import BN from 'bn.js';
import { useStore } from 'src/store';
import { createWeb3Instance } from 'src/web3';
import { computed, onUnmounted, ref, Ref, watch } from 'vue';
import { getVested } from './helper/vested';
import { getChainId, setupNetwork } from 'src/web3';

function useCall(apiRef: any, addressRef: Ref<string>) {
  // should be fixed -- cannot refer it because it goes undefined once it called. to call balance again, it should pass apiRef by external params.
  // const { api: apiRef } = useApi();
  const vestedRef = ref(new BN(0));
  const accountDataRef = ref<AccountData>();
  const store = useStore();
  const isMetamask = computed(() => store.getters['general/isCheckMetamask']);
  const currentNetworkIdx = computed(() => store.getters['general/networkIdx']);
  const isLoading = computed(() => store.getters['general/isLoading']);
  const currentEcdsaAccount = computed(() => store.getters['general/currentEcdsaAccount']);

  const unsub: Ref<VoidFn | undefined> = ref();

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

      let ethereumBalance = new BN(0);
      if (isMetamask.value) {
        try {
          const web3 = await createWeb3Instance(currentNetworkIdx.value);
          if (!web3) {
            throw Error(
              `cannot create the web3 instance with network id ${currentNetworkIdx.value}`
            );
          }
          const chainId = getChainId(currentNetworkIdx.value);
          setTimeout(async () => {
            await setupNetwork(chainId);
          }, 500);

          const rawBal = await web3.eth.getBalance(currentEcdsaAccount.value.ethereum);
          ethereumBalance = new BN(rawBal);
        } catch (error) {
          console.error(error);
        }
      }

      accountDataRef.value = new AccountData(
        accountInfo.data.free,
        accountInfo.data.reserved,
        accountInfo.data.miscFrozen,
        accountInfo.data.feeFrozen,
        vestedRef.value,
        ethereumBalance
      );
    });
  };

  const updateAccountBalance = () => {
    const address = addressRef.value;
    if (!address) return;
    updateAccount(address);
  };

  const updateAccountHandler = setInterval(() => {
    updateAccountBalance();
  }, 12000);

  watch(
    [addressRef, isLoading, isMetamask, currentEcdsaAccount],
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
    accountDataRef,
  };
}

export function useBalance(apiRef: any, addressRef: Ref<string>) {
  const balance = ref(new BN(0));
  const accountData = ref<AccountData>();
  const { accountDataRef } = useCall(apiRef, addressRef);

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
    vested: BN,
    ethereumBalance: BN
  ) {
    this.free = free.toBn();
    this.reserved = reserved.toBn();
    this.miscFrozen = miscFrozen.toBn();
    this.feeFrozen = feeFrozen.toBn();
    this.vested = vested;
    this.ethereumBalance = ethereumBalance;
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
  public ethereumBalance: BN;
}
