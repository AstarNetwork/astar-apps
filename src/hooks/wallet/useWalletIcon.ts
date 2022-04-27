import { supportEvmWalletObj, SupportWallet, supportWalletObj } from 'src/config/wallets';
import { useStore } from 'src/store';
import { computed, ref, watch } from 'vue';
import { getSelectedAccount } from '../helper/wallet';

export function useWalletIcon() {
  const iconWallet = ref<string>('');
  const store = useStore();
  const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);
  const isEthWallet = computed(() => store.getters['general/isEthWallet']);
  const currentWallet = computed(() => store.getters['general/currentWallet']);
  const currentAddress = computed(() => store.getters['general/selectedAddress']);

  watch(
    [currentWallet, currentAddress],
    () => {
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
    },
    { immediate: true }
  );

  return {
    iconWallet,
  };
}
