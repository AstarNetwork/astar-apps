import { VoidFn } from '@polkadot/api/types';
import { Balance, BalanceLockTo212 } from '@polkadot/types/interfaces';
import { PalletVestingVestingInfo, PalletBalancesBalanceLock } from '@polkadot/types/lookup';
import BN from 'bn.js';
import { useStore } from 'src/store';
import { createWeb3Instance, TNetworkId } from 'src/config/web3';
import { computed, onUnmounted, ref, Ref, watch } from 'vue';
import { getProviderIndex } from 'src/config/chainEndpoints';
import { getVested } from './helper/vested';
import { $api } from 'boot/api';
import { getBalance } from 'src/config/web3/utils/transactions';

function useCall(addressRef: Ref<string>) {
  const balanceRef = ref(new BN(0));
  const vestedRef = ref(new BN(0));
  const remainingVests = ref(new BN(0));
  const accountDataRef = ref<AccountData>();
  const store = useStore();
  const isH160Formatted = computed(() => store.getters['general/isH160Formatted']);

  const currentNetworkIdx = computed(() => {
    const chainInfo = store.getters['general/chainInfo'];
    const chain = chainInfo ? chainInfo.chain : '';
    return getProviderIndex(chain);
  });

  const isLoading = computed(() => store.getters['general/isLoading']);
  const dapps = computed(() => store.getters['dapps/getAllDapps']);

  const unsub: Ref<VoidFn | undefined> = ref();

  const updateAccountH160 = async (address: string) => {
    try {
      const web3 = await createWeb3Instance(currentNetworkIdx.value as TNetworkId);

      if (!web3) {
        throw Error(`cannot create the web3 instance with network id ${currentNetworkIdx.value}`);
      }

      const rawBal = await getBalance(web3, address);
      accountDataRef.value = new AccountDataH160(
        new BN(rawBal),
        new BN(0),
        new BN(0),
        new BN(0),
        new BN(0),
        [],
        new BN(0),
        new BN(0),
        []
      );
      balanceRef.value = new BN(rawBal);
    } catch (error) {
      console.error(error);
    }
  };

  const updateAccount = async (address: string) => {
    if (!address) return;
    const api = $api.value!!;

    if (unsub.value) {
      unsub.value();
      unsub.value = undefined;
    }

    const results = await Promise.all([
      api.query.system.account(address),
      api.query.vesting.vesting(address),
      api.query.system.number(),
      api.derive.balances?.all(address),
    ]);

    const accountInfo = results[0];
    const vesting: PalletVestingVestingInfo[] = results[1].unwrapOr(undefined) || [];
    const currentBlock = results[2];
    const vestedClaimable = results[3].vestedClaimable;
    const locks: (PalletBalancesBalanceLock | BalanceLockTo212)[] = results[3].lockedBreakdown;

    const extendedVesting: ExtendedVestingInfo[] = [];
    vestedRef.value = new BN(0);
    remainingVests.value = new BN(0);

    vesting.forEach((v) => {
      const vested = getVested({
        currentBlock: currentBlock.toBn(),
        startBlock: v.startingBlock.toBn() || new BN(0),
        perBlock: v.perBlock || new BN(0),
        locked: v.locked,
      });
      vestedRef.value = vestedRef.value.add(vested);
      remainingVests.value = remainingVests.value.add(v.locked.sub(vested));
      extendedVesting.push(new ExtendedVestingInfo(v, vested));
    });

    accountDataRef.value = new AccountData(
      accountInfo.data.free,
      accountInfo.data.reserved,
      accountInfo.data.miscFrozen,
      accountInfo.data.feeFrozen,
      vestedRef.value,
      extendedVesting,
      vestedClaimable,
      remainingVests.value,
      locks
    );

    balanceRef.value = accountInfo.data.free.toBn();
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

export function useBalance(addressRef: Ref<string>) {
  const balance = ref(new BN(0));
  const accountData = ref<AccountData | AccountDataH160>();

  const { balanceRef, accountDataRef } = useCall(addressRef);

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
    vesting: ExtendedVestingInfo[],
    vestedClaimable: BN,
    remainingVests: BN,
    locks: (PalletBalancesBalanceLock | BalanceLockTo212)[]
  ) {
    this.free = free.toBn();
    this.reserved = reserved.toBn();
    this.miscFrozen = miscFrozen.toBn();
    this.feeFrozen = feeFrozen.toBn();
    this.vested = vested;
    this.vesting = vesting;
    this.vestedClaimable = vestedClaimable;
    this.remainingVests = remainingVests;
    this.locks = locks;
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
  public vesting: ExtendedVestingInfo[];
  public vestedClaimable: BN;
  public remainingVests: BN;
  public locks: (PalletBalancesBalanceLock | BalanceLockTo212)[];
}

// FIXME: the class might be inherited by AccountData
export class AccountDataH160 {
  constructor(
    public free: BN,
    public reserved: BN,
    public miscFrozen: BN,
    public feeFrozen: BN,
    public vested: BN,
    public vesting: ExtendedVestingInfo[],
    public vestedClaimable: BN,
    public remainingVests: BN,
    public locks: (PalletBalancesBalanceLock | BalanceLockTo212)[]
  ) {}

  public getUsableTransactionBalance(): BN {
    return this.free.sub(this.miscFrozen);
  }

  public getUsableFeeBalance(): BN {
    return this.free.sub(this.feeFrozen);
  }
}

export class ExtendedVestingInfo {
  constructor(public basicInfo: PalletVestingVestingInfo, public vested: BN) {}
}
