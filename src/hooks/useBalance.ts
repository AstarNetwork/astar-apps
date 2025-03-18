import { ETHEREUM_EXTENSION } from 'src/modules/account';
import { VoidFn } from '@polkadot/api/types';
import { BalanceLockTo212 } from '@polkadot/types/interfaces';
import { PalletBalancesBalanceLock, PalletVestingVestingInfo } from 'src/v2/models';
import { BN, u8aToString } from '@polkadot/util';
import { $api, $web3 } from 'boot/api';
import { SystemAccount } from 'src/modules/account';
import { useStore } from 'src/store';
import { computed, onUnmounted, ref, Ref, watch } from 'vue';
import { isValidEvmAddress } from '@astar-network/astar-sdk-core';
import { useDapps } from 'src/staking-v3';
import { Option, Vec, u128, u32 } from '@polkadot/types';

// Temporarily moved here until uplift polkadot js for astar.js
export const getVested = ({
  currentBlock,
  startBlock,
  perBlock,
  locked,
}: {
  currentBlock: BN;
  startBlock: BN;
  perBlock: BN;
  locked: BN;
}): BN => {
  if (currentBlock.lt(startBlock)) {
    return new BN(0);
  }

  const blockHasPast = currentBlock.sub(startBlock);
  const vested = BN.min(locked, blockHasPast.mul(perBlock));
  return vested;
};

function useCall(addressRef: Ref<string>) {
  const { allDapps } = useDapps();
  const balanceRef = ref(new BN(0));
  const vestedRef = ref(new BN(0));
  const remainingVests = ref(new BN(0));
  const accountDataRef = ref<AccountData>();
  const store = useStore();
  const isLoadingAccount = ref<boolean>(true);

  const isLoading = computed<boolean>(() => store.getters['general/isLoading']);

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
      api.query.vesting.vesting<Option<Vec<PalletVestingVestingInfo>>>(address),
      api.query.system.number<u32>(),
      api.derive.balances?.all(address),
    ]);

    const accountInfo = results[0];
    const vesting = results[1].unwrapOr(undefined)?.toArray() || [];
    const currentBlock = results[2];
    const vestedClaimable = results[3].vestedClaimable;
    const locks = <(PalletBalancesBalanceLock | BalanceLockTo212)[]>results[3].lockedBreakdown;

    const extendedVesting: ExtendedVestingInfo[] = [];
    vestedRef.value = new BN(0);
    remainingVests.value = new BN(0);

    vesting.forEach((v) => {
      const vested = getVested({
        currentBlock: currentBlock.toBn(),
        startBlock: v.startingBlock.toBn() || new BN(0),
        perBlock: v.perBlock.toBn() || new BN(0),
        locked: v.locked.toBn(),
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
    [addressRef, isLoading, allDapps],
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
  const lockedInDemocracy = computed(() => {
    const lock = accountData.value?.locks.find((it) => u8aToString(it.id) === 'democrac');

    return lock ? lock.amount.toBigInt() : BigInt(0);
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

  return { balance, accountData, useableBalance, isLoadingBalance, lockedInDemocracy };
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
    // refs.
    // https://wiki.polkadot.network/docs/learn-account-balances
    // https://github.com/paritytech/polkadot-sdk/blob/e8da320734ae44803f89dd2b35b3cfea0e1ecca1/substrate/frame/balances/src/impl_fungible.rs#L44
    const existentialDeposit = <u128>$api?.consts.balances.existentialDeposit;
    if (!existentialDeposit) {
      return new BN(0);
    }

    const untouchable = BN.max(this.frozen.sub(this.reserved), existentialDeposit);
    return this.free.sub(untouchable);
  }

  public getUsableFeeBalance(): BN {
    return this.getUsableTransactionBalance();
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

export class AccountDataH160 extends AccountData {
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
    super(free, reserved, frozen, flags, vested, vesting, vestedClaimable, remainingVests, locks);
  }
}

export class ExtendedVestingInfo {
  constructor(public basicInfo: PalletVestingVestingInfo, public vested: BN) {}
}
