import { ASTAR_DECIMALS, defaultAmountWithDecimals } from './helper/plasmUtils';
import { useStore } from 'src/store';
import { VoidFn } from '@polkadot/api/types';
import { Balance } from '@polkadot/types/interfaces';
import BN from 'bn.js';
import { createWeb3Instance } from 'src/web3';
import { onUnmounted, ref, Ref, watch, computed } from 'vue';
import { getVested } from './helper/vested';
import { getLatestStakePoint } from 'src/store/dapps-store/actions';

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

  const getTotalStakedAmount = async ({
    api,
    dappAddress,
    address,
  }: {
    api: any;
    dappAddress: string;
    address: string;
  }): Promise<string> => {
    try {
      if (!api) return '0';
      const stakeInfo = await getLatestStakePoint(api, dappAddress);
      if (!stakeInfo) return '0';

      let stakedAmount = '0';
      for (const [account, balance] of stakeInfo.stakers) {
        if (account.toString() === address) {
          stakedAmount = balance.toString();
        }
      }
      return stakedAmount;
    } catch (e) {
      console.error(e);
      return '0';
    }
  };

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
        new BN(0),
        new BN(0)
      );
      balanceRef.value = new BN(rawBal);
    } catch (error) {
      console.error(error);
    }
  };

  const updateAccount = (address: string, dapps: any[]) => {
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
      balanceRef.value = accountInfo.data.free.toBn();

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

      if (!dapps) {
        // Section: Balance
        accountDataRef.value = new AccountData(
          accountInfo.data.free,
          accountInfo.data.reserved,
          accountInfo.data.miscFrozen,
          accountInfo.data.feeFrozen,
          vestedRef.value,
          new BN(0)
        );
      } else {
        // Section: Store
        const staked: BN[] = [];
        await Promise.all(
          dapps.map(async (dapp) => {
            const stakedAmount = await getTotalStakedAmount({
              api,
              dappAddress: dapp.address,
              address,
            });
            stakedAmount && staked.push(new BN(stakedAmount));
          })
        );

        const sum = (arr: BN[]) => arr.reduce((a: BN, b: BN) => a.add(b), new BN(0));
        const formattedStakedAmount = sum(staked);

        accountDataRef.value = new AccountData(
          accountInfo.data.free,
          accountInfo.data.reserved,
          accountInfo.data.miscFrozen,
          accountInfo.data.feeFrozen,
          vestedRef.value,
          new BN(formattedStakedAmount)
        );
      }
    });
  };

  const updateAccountHandler = setInterval(() => {
    if (!vestedRef.value.eq(new BN(0))) {
      updateAccount(addressRef.value, dapps.value || []);
    }
  }, 10000);

  watch(
    [addressRef, isLoading, dapps],
    () => {
      const address = addressRef.value;
      if (isH160Formatted.value) {
        updateAccountH160(address);
      } else {
        updateAccount(address, dapps.value || []);
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
    staked: BN
  ) {
    this.free = free.toBn();
    this.reserved = reserved.toBn();
    this.miscFrozen = miscFrozen.toBn();
    this.feeFrozen = feeFrozen.toBn();
    this.vested = vested;
    this.staked = staked;
  }

  public getUsableTransactionBalance(): BN {
    return this.free.sub(this.miscFrozen);
  }

  public getUsableFeeBalance(): BN {
    return this.free.sub(this.feeFrozen);
  }

  public getUsableStakeBalance(): BN {
    console.log('this.free: ', this.free.toString());
    console.log('this.miscFrozen: ', this.miscFrozen.toString());
    console.log('this.staked: ', this.staked.toString());
    console.log(
      'this.free.sub(this.miscFrozen).sub(this.staked):',
      this.free.sub(this.miscFrozen).sub(this.staked).toString()
    );
    return this.free.sub(this.miscFrozen).sub(this.staked);
  }

  public free: BN;
  public reserved: BN;
  public miscFrozen: BN;
  public feeFrozen: BN;
  public vested: BN;
  public staked: BN;
}
export class AccountDataH160 {
  constructor(
    public free: BN,
    public reserved: BN,
    public miscFrozen: BN,
    public feeFrozen: BN,
    public vested: BN,
    public staked: BN
  ) {}

  public getUsableTransactionBalance(): BN {
    return this.free.sub(this.miscFrozen);
  }

  public getUsableFeeBalance(): BN {
    return this.free.sub(this.feeFrozen);
  }

  public getUsableStakeBalance(): BN {
    return this.free.sub(this.miscFrozen).sub(this.staked);
  }
}
