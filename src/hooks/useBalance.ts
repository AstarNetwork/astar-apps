import { ETHEREUM_EXTENSION } from 'src/hooks';
import { DappCombinedInfo } from 'src/v2/models/DappsStaking';
import { VoidFn } from '@polkadot/api/types';
import { BalanceLockTo212 } from '@polkadot/types/interfaces';
import { PalletBalancesBalanceLock, PalletVestingVestingInfo } from '@polkadot/types/lookup';
import { BN } from '@polkadot/util';
import { $api, $web3 } from 'boot/api';
import { SystemAccount } from 'src/modules/account';
import { useStore } from 'src/store';
import { computed, onUnmounted, ref, Ref, watch } from 'vue';
import { getVested, isValidEvmAddress } from '@astar-network/astar-sdk-core';

function useCall(addressRef: Ref<string>) {
  const balanceRef = ref(new BN(0));
  const vestedRef = ref(new BN(0));
  const remainingVests = ref(new BN(0));
  const accountDataRef = ref<AccountData>();
  const store = useStore();
  const isLoadingAccount = ref<boolean>(true);

  const isLoading = computed<boolean>(() => store.getters['general/isLoading']);
  const dapps = computed<DappCombinedInfo[]>(() => store.getters['dapps/getAllDapps']);

  const unsub: Ref<VoidFn | undefined> = ref();

  const updateAccountH160 = async (address: string) => {
    try {
      const web3Ref = $web3.value;
      if (!web3Ref || !web3Ref.utils.isAddress(address)) {
        return;
      }
      const rawBal = await web3Ref.eth.getBalance(address);
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
    const api = $api!!;

    if (unsub.value) {
      unsub.value();
      unsub.value = undefined;
    }

    const results = await Promise.all([
      api.query.system.account<SystemAccount>(address),
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
      accountInfo.data.frozen,
      accountInfo.data.flags,
      vestedRef.value,
      extendedVesting,
      vestedClaimable,
      remainingVests.value,
      locks
    );

    balanceRef.value = accountInfo.data.free.add(accountInfo.data.reserved);
  };

  const updateAccountBalance = () => {
    const address = addressRef.value;
    if (address !== ETHEREUM_EXTENSION) {
      if (isValidEvmAddress(address)) {
        updateAccountH160(address);
      } else {
        updateAccount(address);
      }
    }
  };

  const updateAccountHandler = setInterval(() => {
    updateAccountBalance();
  }, 12000);

  watch(
    [addressRef, isLoading, dapps],
    () => {
      isLoadingAccount.value = true;
      updateAccountBalance();
      isLoadingAccount.value = false;
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
    isLoadingAccount,
  };
}

export function useBalance(addressRef: Ref<string>) {
  const balance = ref(new BN(0));
  const accountData = ref<AccountData | AccountDataH160>();
  const useableBalance = computed(() => {
    return accountData.value?.getUsableFeeBalance().toString() || '0';
  });
  const isLoadingBalance = ref<boolean>(true);

  const { balanceRef, accountDataRef, isLoadingAccount } = useCall(addressRef);

  watch([addressRef], () => {
    isLoadingBalance.value = true;
  });

  watch(
    [addressRef, balanceRef, isLoadingAccount],
    () => {
      if (balanceRef.value && addressRef && !isLoadingAccount.value) {
        balance.value = balanceRef.value;
        isLoadingBalance.value = false;
      }
    },
    { immediate: false }
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

  return { balance, accountData, useableBalance, isLoadingBalance };
}

export class AccountData {
  constructor(
    free: BN,
    reserved: BN,
    frozen: BN,
    flags: BN,
    vested: BN,
    vesting: ExtendedVestingInfo[],
    vestedClaimable: BN,
    remainingVests: BN,
    locks: (PalletBalancesBalanceLock | BalanceLockTo212)[]
  ) {
    this.free = free;
    this.reserved = reserved;
    this.frozen = frozen;
    this.flags = flags;
    this.vested = vested;
    this.vesting = vesting;
    this.vestedClaimable = vestedClaimable;
    this.remainingVests = remainingVests;
    this.locks = locks;
  }

  public getUsableTransactionBalance(): BN {
    return this.free.sub(this.frozen);
  }

  public getUsableFeeBalance(): BN {
    return this.free.sub(this.frozen);
  }

  public free: BN;
  public reserved: BN;
  public frozen: BN;
  public flags: BN;
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
    public frozen: BN,
    public flags: BN,
    public vested: BN,
    public vesting: ExtendedVestingInfo[],
    public vestedClaimable: BN,
    public remainingVests: BN,
    public locks: (PalletBalancesBalanceLock | BalanceLockTo212)[]
  ) {}

  public getUsableTransactionBalance(): BN {
    return this.free.sub(this.frozen);
  }

  public getUsableFeeBalance(): BN {
    return this.free.sub(this.flags);
  }
}

export class ExtendedVestingInfo {
  constructor(public basicInfo: PalletVestingVestingInfo, public vested: BN) {}
}
