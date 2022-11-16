import { DappCombinedInfo } from 'src/v2/models/DappsStaking';
import { Path } from 'src/router';
import { useStore } from 'src/store';
import { computed, watchEffect } from 'vue';
import { useRouter } from 'vue-router';

// Memo: Redirect to /dapp-staking/discover when users change the networks on the staking or dApp page
export function useDappRedirect() {
  const store = useStore();
  const router = useRouter();
  const dappAddress = computed<string>(() => router.currentRoute.value.query.dapp as string);
  const dapps = computed<DappCombinedInfo[]>(() => store.getters['dapps/getAllDapps']);

  const handleRedirect = (): void => {
    if (dappAddress.value && dapps.value.length > 0) {
      const dapp = dapps.value.find(
        (it: any) => it.contract.address.toLowerCase() === dappAddress.value.toLowerCase()
      );
      !dapp &&
        router.push({
          path: Path.DappStaking,
        });
    }
  };

  watchEffect(handleRedirect);
}
