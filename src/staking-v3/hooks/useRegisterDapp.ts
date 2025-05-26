import { watch, ref } from 'vue';
import { container } from 'src/v2/common';
import { IDappStakingRepository } from '../logic';
import { Symbols } from 'src/v2/symbols';
import { useAccount, useNetworkInfo } from 'src/hooks';
import { useDapps } from './useDapps';

export function useRegisterDapp() {
  const { currentAccount } = useAccount();
  const { getDappByOwner } = useDapps();
  const { currentNetworkName } = useNetworkInfo();

  const dappAddressToRegister = ref<string | undefined>();

  const getDappAddressToRegister = async (): Promise<string | undefined> => {
    const repository = container.get<IDappStakingRepository>(Symbols.DappStakingRepositoryV3);
    const developerContract = currentAccount.value
      ? getDappByOwner(currentAccount.value)?.address
      : undefined;
    if (developerContract) {
      const dapp = await repository.getDapp(currentNetworkName.value, developerContract);
      return dapp === undefined ? developerContract : undefined;
    }

    return undefined;
  };

  watch(
    [currentAccount],
    async () => {
      if (currentAccount) {
        dappAddressToRegister.value = await getDappAddressToRegister();
      }
    },
    { immediate: true }
  );

  return { dappAddressToRegister };
}
