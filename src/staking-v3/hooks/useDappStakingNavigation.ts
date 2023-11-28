import { useRouter } from 'vue-router';
import { Path, networkParam } from 'src/router/routes';

export function useDappStakingNavigation() {
  const router = useRouter();

  const navigateToVote = (dAppAddress: string | undefined = undefined): void => {
    const base = networkParam + Path.DappStaking + Path.Vote;
    router.push(`${base}?dappAddress=${dAppAddress ?? ''}`);
  };

  const navigateToHome = (): void => {
    const base = networkParam + Path.DappStaking;
    router.push(base);
  };

  const navigateDappPage = (address: string): void => {
    const base = networkParam + Path.DappStaking + Path.Dapp;
    const url = `${base}?dapp=${address?.toLowerCase()}`;
    router.push(url);
  };

  return { navigateToVote, navigateToHome, navigateDappPage };
}
