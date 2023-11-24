import { watch, ref } from 'vue';
import { CombinedDappInfo, useDapps } from '..';

export function useLeaderboard() {
  const { registeredDapps } = useDapps();
  // Map key is a dApp tier.
  const leaderBoards = ref<Map<number, CombinedDappInfo[]>>(new Map());

  const calculateLeaderboard = (): void => {
    console.log('Calculating leaderboard');
    leaderBoards.value = new Map();

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

    // TODO fix this when we have tiers assigned to dapps.
    leaderBoards.value.set(1, sortedDapps);
    leaderBoards.value.set(2, []);
    leaderBoards.value.set(3, []);
    leaderBoards.value.set(4, []);
  };

  watch(registeredDapps, () => {
    calculateLeaderboard();
  });

  return { leaderBoards };
}
