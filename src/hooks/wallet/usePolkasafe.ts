import Polkasafe from 'polkasafe';
import { useAccount } from 'src/hooks/useAccount';
import { useStore } from 'src/store';
import { watchEffect } from 'vue';

export const usePolkasafe = () => {
  // const { currentAccount } = useAccount();
  // const store = useStore();

  watchEffect(() => {
    // @ts-ignore
    const client = new Polkasafe();
  });

  return {};
};
