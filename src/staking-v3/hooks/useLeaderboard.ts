import { watch, ref } from 'vue';
import { CombinedDappInfo, useDappStaking, useDapps } from '..';

export function useLeaderboard() {
  const { registeredDapps } = useDapps();
  const { dAppTiers } = useDappStaking();
  // Map key is a dApp tier.
  const leaderBoards = ref<Map<number, CombinedDappInfo[]>>(new Map());

  const calculateLeaderboard = (): void => {
    console.log('Calculating leaderboard');
    leaderBoards.value = new Map([
      [1, []],
      [2, []],
      [3, []],
      [4, []],
    ]);

    // ignore Tiers for now
    const sortedDapps = registeredDapps.value.sort((a, b) => {
      const valueA = a.chain?.totalStake ?? BigInt(0);
      const valueB = b.chain?.totalStake ?? BigInt(0);

      // memo couldn't do return valueB - valueA because it's a bigint.
      if (valueA < valueB) {
        return 1;
      } else if (valueA > valueB) {
        return -1;
      } else {
        return 0;
      }
    });

    sortedDapps.forEach((dapp) => {
      const tier = dAppTiers.value.dapps.find((x) => x.dappId === dapp.chain.id)?.tierId;
      tier !== undefined && leaderBoards.value.get(tier + 1)?.push(dapp);
    });
  };

  watch(
    registeredDapps,
    () => {
      calculateLeaderboard();
    },
    { immediate: true }
  );

  return { leaderBoards };
}
