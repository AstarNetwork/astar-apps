import { useRouter } from 'vue-router';
import { Path, networkParam } from 'src/router/routes';

export function useDappStakingNavigation() {
  const router = useRouter();

  const navigateToVote = (dAppAddress: string | undefined = undefined): void => {
    const base = networkParam + Path.DappStaking + Path.Vote;
    router.push(`${base}?dappAddress=${dAppAddress?.toLowerCase() ?? ''}`);
  };

  const navigateToMove = (dAppAddress: string): void => {
    const base = networkParam + Path.DappStaking + Path.Vote;
    router.push(`${base}?moveFromAddress=${dAppAddress ?? ''}`);
  };

  const navigateToHome = (): void => {
    const base = networkParam + Path.DappStaking + Path.Discover;
    router.push(base);
  };

  const navigateDappPage = (address: string): void => {
    const base = networkParam + Path.DappStaking + Path.Dapp;
    const url = `${base}?dapp=${address?.toLowerCase()}`;
    router.push(url);
  };

  const goBack = () => router.go(-1);

  const navigateOwnerPage = (address: string): string => {
    return networkParam + Path.DappStaking + Path.Owner + `?dapp=${address}`;
  };

  return {
    navigateToVote,
    navigateToMove,
    navigateToHome,
    navigateDappPage,
    navigateOwnerPage,
    goBack,
  };
}
