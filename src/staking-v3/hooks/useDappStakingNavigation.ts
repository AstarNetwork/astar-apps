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
    router.push(getDappPageUrl(address));
  };

  const getDappPageUrl = (address: string): string => {
    const base = networkParam + Path.DappStaking + Path.Dapp;
    return `${base}?dapp=${address?.toLowerCase()}`;
  };

  const goBack = () => router.go(-1);

  const navigateOwnerPage = (address: string): string =>
    networkParam + Path.DappStaking + Path.Owner + `?dapp=${address}`;

  const getRegisterPageUrl = (): string => networkParam + Path.DappStaking + Path.Register;

  const navigateToAssets = (): void => {
    const base = networkParam + Path.Assets + '#staking';
    router.push(base);
  };

  return {
    navigateToVote,
    navigateToMove,
    navigateToHome,
    navigateDappPage,
    navigateOwnerPage,
    getDappPageUrl,
    goBack,
    getRegisterPageUrl,
    navigateToAssets,
  };
}
