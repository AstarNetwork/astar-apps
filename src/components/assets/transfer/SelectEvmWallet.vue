<template>
  <div class="box--input-select-wallet box--input-select-wallet box--hover--active">
    <div class="box__space-between">
      <span> {{ $t('assets.modals.evmWalletAddress') }}</span>
      <div />
    </div>
    <div class="wrapper--select-chain">
      <div
        class="row__chain"
        :class="selectableAccounts.length && 'cursor-pointer'"
        @click="isOpen = true"
      >
        <img v-if="selectedAccount.img" width="24" :src="selectedAccount.img" />
        <input
          v-click-away="closeOption"
          :value="displayWalletAddr(selectedAccount.name, selectedAccount.address)"
          class="input--chain text--title"
          :class="selectableAccounts.length && 'cursor-pointer'"
          type="text"
          spellcheck="false"
          :readonly="true"
        />

        <astar-icon-base
          v-if="selectableAccounts.length"
          class="icon--selector"
          icon-name="selector"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <astar-icon-solid-selector />
        </astar-icon-base>
      </div>

      <div v-if="isOpen && selectableAccounts.length" class="box--chain-option">
        <ul v-for="(account, index) in selectableAccounts" :key="index" class="container--chain">
          <li role="option" class="list" @click="setAccount(account)">
            <div class="list__row">
              <div class="box__row">
                <img width="24" :src="account.img" alt="wallet-icon" />
                <div class="column--chain-name">
                  <span class="text--title">
                    {{ displayWalletAddr(account.name, account.address) }}
                  </span>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { supportEvmWallets, SupportWallet } from 'src/config/wallets';
import { getEvmProvider } from 'src/hooks/helper/wallet';
import { computed, defineComponent, ref, watchEffect, WatchCallback, watch } from 'vue';
import { getShortenAddress } from 'src/hooks/helper/addressUtils';
import { EthereumProvider } from 'src/hooks/types/CustomSignature';

interface EvmAccount {
  address: string;
  name: string;
  source: string;
  img: string;
}

export default defineComponent({
  props: {
    initializeXcmApi: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const isOpen = ref<boolean>(false);
    const evmAccounts = ref<EvmAccount[]>([]);
    const selectedAccount = ref<EvmAccount>({ address: '', name: '', source: '', img: '' });
    const selectedProvider = ref<EthereumProvider>();

    const closeOption = (): void => {
      isOpen.value = false;
    };

    const selectableAccounts = computed<EvmAccount[]>(() => {
      const accounts = evmAccounts.value.filter((it) => it.name !== selectedAccount.value.name);
      return accounts;
    });

    const setAccount = async (account: EvmAccount): Promise<void> => {
      selectedAccount.value = account;
      localStorage.setItem(LOCAL_STORAGE.XCM_DEPOSIT_EVM_WALLET, account.source);
      await props.initializeXcmApi(true);
    };

    const displayWalletAddr = (name: string, address: string): string => {
      return name + ' ' + ' ' + getShortenAddress(address.toLowerCase(), 4);
    };

    const setEvmAccounts = async (): Promise<void> => {
      const evmExtensions = supportEvmWallets.filter((it) => it.isSupportBrowserExtension);
      const accounts = await Promise.all(
        evmExtensions.map(async (it) => {
          try {
            const provider = getEvmProvider(it.source);
            if (!provider) return undefined;
            const [address] = (await provider.request({
              method: 'eth_requestAccounts',
            })) as string;
            if (address) {
              return { address, name: it.name, source: it.source, img: it.img };
            } else {
              return undefined;
            }
          } catch (error) {
            console.error(error);
            return undefined;
          }
        })
      );
      evmAccounts.value = accounts.filter((it) => it !== undefined) as EvmAccount[];
    };

    const setEvmAccount = (): void => {
      if (!evmAccounts.value) return;
      const storedProvider = localStorage.getItem(LOCAL_STORAGE.XCM_DEPOSIT_EVM_WALLET);
      if (storedProvider) {
        const { address, name, source, img } = evmAccounts.value.find(
          (it) => it.source === storedProvider
        )!;
        selectedAccount.value = { address, name, source, img };
      } else {
        const { address, name, source, img } = evmAccounts.value[0];
        selectedAccount.value = { address, name, source, img };
      }
      const provider = getEvmProvider(selectedAccount.value.source as SupportWallet);
      if (provider) {
        selectedProvider.value = provider;
      }
    };

    const handleUpdateEvmWallet = async (): Promise<void> => {
      await setEvmAccounts();
      setEvmAccount();
    };

    // Memo: monitor the account that is selected on the EVM wallet
    const handleEvmAccountChange: WatchCallback<EthereumProvider | undefined> = (
      provider,
      _,
      registerCleanup
    ) => {
      if (provider) {
        const handleAccountsChanged = async () => {
          await handleUpdateEvmWallet();
          await props.initializeXcmApi(true);
        };

        // Memo: subscribe to changes
        provider.on('accountsChanged', handleAccountsChanged);

        // Memo: unsubscribe / prevent memory leak
        registerCleanup(() => {
          provider.removeListener('accountsChanged', handleAccountsChanged);
        });
      }
    };

    watchEffect(handleUpdateEvmWallet);
    watch(selectedProvider, handleEvmAccountChange, { immediate: true });

    return {
      isOpen,
      selectableAccounts,
      selectedAccount,
      closeOption,
      setAccount,
      displayWalletAddr,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/select-evm-wallet.scss';
</style>
