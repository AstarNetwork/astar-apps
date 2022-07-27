<template>
  <div class="wrapper--select-chain">
    <div
      class="row__chain"
      :class="selectableAccounts.length && 'cursor-pointer'"
      @click="isOpen = true"
    >
      <img v-if="selectedAccount.img" width="24" :src="selectedAccount.img" />
      <input
        :value="displayWalletAddr(selectedAccount.name, selectedAccount.address)"
        class="input--chain text--title"
        :class="selectableAccounts.length && 'cursor-pointer'"
        type="text"
        spellcheck="false"
        :readonly="true"
        @blur="closeOption"
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
</template>
<script lang="ts">
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { supportEvmWallets } from 'src/config/wallets';
import { wait } from 'src/hooks/helper/common';
import { getEvmProvider } from 'src/hooks/helper/wallet';
import { computed, defineComponent, ref, watchEffect } from 'vue';
import { getShortenAddress } from 'src/hooks/helper/addressUtils';

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

    const closeOption = async (): Promise<void> => {
      // Memo: wait for updating the chain state before closing
      const delay = 200;
      await wait(delay);
      isOpen.value = false;
    };

    const selectableAccounts = computed<EvmAccount[]>(() => {
      const accounts = evmAccounts.value.filter((it) => it.name !== selectedAccount.value.name);
      return accounts;
    });

    const setAccount = async (account: EvmAccount): Promise<void> => {
      selectedAccount.value = account;
      localStorage.setItem(LOCAL_STORAGE.XCM_DEPOSIT_EVM_WALLET, account.source);
      const reset = true;
      await props.initializeXcmApi(reset);
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
    };

    const handleUpdateEvmWallet = async (): Promise<void> => {
      await setEvmAccounts();
      setEvmAccount();
    };

    watchEffect(handleUpdateEvmWallet);

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
@use 'src/components/assets/styles/modal-select-chain.scss';
</style>
