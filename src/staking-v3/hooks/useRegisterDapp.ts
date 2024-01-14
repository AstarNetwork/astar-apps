import { watch, ref } from 'vue';
import { container } from 'src/v2/common';
import { IDappStakingServiceV2V3 } from '../logic';
import { Symbols } from 'src/v2/symbols';
import { useAccount, useNetworkInfo } from 'src/hooks';
import { useDapps } from './useDapps';

export function useRegisterDapp() {
  const { currentAccount, isH160Formatted } = useAccount();
  const { getDappByOwner } = useDapps();
  const { currentNetworkName } = useNetworkInfo();

  const dappAddressToRegister = ref<string | undefined>();

  const getDappAddressToRegister = async (): Promise<string | undefined> => {
    const service = container.get<IDappStakingServiceV2V3>(Symbols.DappStakingServiceV2V3);
    const developerContract =
      currentAccount.value && !isH160Formatted.value
        ? getDappByOwner(currentAccount.value)?.address
        : undefined;
    if (developerContract) {
      const dapp = await service.getDapp(developerContract, currentNetworkName.value);
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
