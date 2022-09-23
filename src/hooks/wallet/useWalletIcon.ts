import { useAccount } from 'src/hooks';
import { supportEvmWalletObj, SupportWallet, supportWalletObj } from 'src/config/wallets';
import { useStore } from 'src/store';
import { computed, ref, watch, watchEffect } from 'vue';
import { getSelectedAccount } from '../helper/wallet';
import { LOCAL_STORAGE } from 'src/config/localStorage';

export function useWalletIcon() {
  const iconWallet = ref<string>('');
  const store = useStore();
  const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);
  const isEthWallet = computed(() => store.getters['general/isEthWallet']);
  const currentWallet = computed(() => store.getters['general/currentWallet']);
  const { currentAccount } = useAccount();

  const setIconWallet = () => {
    try {
      const account = getSelectedAccount(substrateAccounts.value);
      if (isEthWallet.value) {
        const wallet = currentWallet.value || SupportWallet.MetaMask;
        // @ts-ignore
        iconWallet.value = supportEvmWalletObj[wallet].img;
      } else if (account) {
        // @ts-ignore
        iconWallet.value = supportWalletObj[account.source].img;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSetIconWallet = async (): Promise<void> => {
    window.addEventListener(LOCAL_STORAGE.SELECTED_WALLET, () => {
      setIconWallet();
    });
  };

  watchEffect(handleSetIconWallet);

  watch(
    [currentAccount],
    () => {
      setIconWallet();
    },
    { immediate: true }
  );

  return {
    iconWallet,
  };
}
