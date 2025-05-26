import { computed } from 'vue';
import { useStore } from 'src/store';
import { IDappStakingRepository } from 'src/staking-v3';
import { container } from 'src/v2/common';
import { IWalletService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';

export function useSignPayload() {
  const store = useStore();
  const selectedAddress = computed(() => store.getters['general/selectedAddress']);

  const signPayload = async (
    developerAddress: string,
    contractAddress: string
  ): Promise<string> => {
    const dappStakingRepository = container.get<IDappStakingRepository>(
      Symbols.DappStakingRepositoryV3
    );
    const payload = (
      await dappStakingRepository.getRegisterDappCall(developerAddress, contractAddress)
    ).toHex();

    const wallet = container.get<() => IWalletService>(Symbols.WalletFactory)();
    const result = await wallet.signMessage(selectedAddress.value, payload as string);
    return result;
  };

  return {
    signPayload,
  };
}
