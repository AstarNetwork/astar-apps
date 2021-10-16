import { setupNetwork } from './../web3/utils/index';
import { VoidFn } from '@polkadot/api/types';
import { Balance } from '@polkadot/types/interfaces';
import BN from 'bn.js';
import { useStore } from 'src/store';
import { getChainData, getChainId } from 'src/web3';
import { onUnmounted, ref, Ref, watch, computed } from 'vue';
import { getVested } from './helper/vested';
import Web3 from 'web3';
import { AbstractInt } from '@polkadot/types/codec/AbstractInt';

function useCall(apiRef: any, addressRef: Ref<string>) {
  // should be fixed -- cannot refer it because it goes undefined once it called. to call balance again, it should pass apiRef by external params.
  // const { api: apiRef } = useApi();
  const balanceRef = ref(new BN(0));
  const vestedRef = ref(new BN(0));
  const accountDataRef = ref<AccountData>();
  const store = useStore();
  const isCheckMetamaskH160 = computed(() => store.getters['general/isCheckMetamaskH160']);
  const currentNetworkIdx = computed(() => store.getters['general/networkIdx']);

  const unsub: Ref<VoidFn | undefined> = ref();

  const updateAccountH160 = async (address: string) => {
    try {
      const chainId = getChainId(currentNetworkIdx.value);
      const network = getChainData(chainId);
      await setupNetwork(chainId);
      const web3 = new Web3(network.rpcUrls[0]);
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
    if (address) {
      const api = apiRef?.value;
      if (unsub.value) {
        unsub.value();
        unsub.value = undefined;
      }
      if (address && api) {
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
      }
    }
  };

  const updateAccountHandler = setInterval(() => {
    if (!vestedRef.value.eq(new BN(0))) {
      updateAccount(addressRef.value);
    }
  }, 10000);

  watch(
    () => addressRef.value,
    (address) => {
      if (isCheckMetamaskH160.value) {
        updateAccountH160(address);
      } else {
        updateAccount(address);
      }
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

  // Fixme: Update the latest `vested` when block has been updated.
  // (implement something like useInterval might be better.)
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
