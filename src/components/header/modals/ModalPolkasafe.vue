<template>
  <astar-modal-drawer
    :show="isOpen && !isSelected"
    :title="$t('multisig')"
    :is-closing="isClosing"
    :is-back="true"
    :handle-back="backModal"
    @close="closeModal"
  >
    <div class="wrapper--modal-account">
      <div class="wrapper--select-network">
        <div class="row--separator--account">
          <div class="border--separator--account" />
        </div>
        <div>
          <select-signatory
            :selected-signatory="selectedSignatory"
            :set-selected-signatory="setSelectedSignatory"
          />
        </div>
        <div class="row--balance-option">
          <div class="column--balance-option">
            <span class="text--option-label">
              {{ $t('wallet.showBalance', { token: nativeTokenSymbol }) }}
            </span>
            <!-- Memo: `toggle--custom`: defined in app.scss due to unable to define in this file -->
            <div class="toggle--custom">
              <q-toggle v-model="isShowBalance" color="#0085ff" />
            </div>
          </div>
        </div>
        <div v-if="isLoadingPolkasafe && selectedSignatory" class="row--zero-accounts">
          <span>{{ $t('wallet.multisig.initPolkasafe') }}</span>
          <div class="row--skeleton">
            <q-skeleton type="text" />
          </div>
        </div>
        <div
          v-if="!isLoadingPolkasafe && selectedSignatory && multisigAccounts.length === 0"
          class="row--zero-accounts"
        >
          <span> {{ $t('wallet.multisig.noAccounts') }}</span>
          <a :href="polkasafeUrl" target="_blank" rel="noopener noreferrer" class="link--polkasafe">
            {{ $t('wallet.multisig.goToPokasafe') }}
          </a>
        </div>
        <fieldset>
          <ul role="radiogroup" class="list--account" :style="`max-height: ${windowHeight}px`">
            <li v-for="(account, index) in multisigAccounts" :key="index">
              <label
                :class="[
                  'class-radio',
                  selAccount === account.address ? 'class-radio-on' : 'class-radio-off',
                ]"
              >
                <astar-radio-btn
                  :checked="selAccount === account.address"
                  class="radio-btn"
                  @change="selAccount = account.address"
                />
                <div class="wrapper--account-detail">
                  <div class="box--account">
                    <div class="row--account">
                      <div class="account-name">
                        <span>
                          {{ account.name }}
                        </span>
                      </div>
                      <div class="address">
                        <span>
                          {{ getShortenAddress(account.address, 4) }}
                        </span>
                      </div>
                    </div>
                    <div class="row--balance-icons">
                      <div>
                        <span v-if="isShowBalance" class="text--balance">
                          {{ $n(displayBalance(account.balance)) }}
                          {{ nativeTokenSymbol }}
                        </span>
                        <span v-else class="text--balance-hide">
                          ----- {{ nativeTokenSymbol }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="icons">
                    <button class="box--share btn--primary" @click="copyAddress(account.address)">
                      <div class="icon--primary">
                        <astar-icon-copy />
                      </div>
                      <q-tooltip>
                        <span class="text--tooltip">{{ $t('copy') }}</span>
                      </q-tooltip>
                    </button>
                    <a :href="subScan + account.address" target="_blank" rel="noopener noreferrer">
                      <button class="box--share btn--primary">
                        <div class="icon--primary">
                          <astar-icon-external-link />
                        </div>
                        <q-tooltip>
                          <span class="text--tooltip">{{ $t('subscan') }}</span>
                        </q-tooltip>
                      </button>
                    </a>
                  </div>
                </div>
                <div v-if="index === previousSelIdx" class="dot" />
              </label>
            </li>
          </ul>
        </fieldset>
      </div>
      <div class="wrapper__row--button">
        <astar-button
          :disabled="multisigAccounts.length === 0 || !selAccount"
          class="btn--connect"
          @click="selectAccount(selAccount)"
        >
          {{ $t('connect') }}
        </astar-button>
      </div>
    </div>
  </astar-modal-drawer>
</template>
<script lang="ts">
import {
  fetchNativeBalance,
  getShortenAddress,
  isValidAddressPolkadotAddress,
  truncate,
  wait,
} from '@astar-network/astar-sdk-core';
import { ApiPromise } from '@polkadot/api';
import { web3Enable } from '@polkadot/extension-dapp';
import { encodeAddress } from '@polkadot/util-crypto';
import copy from 'copy-to-clipboard';
import { ethers } from 'ethers';
import { Polkasafe } from 'polkasafe';
import { $api } from 'src/boot/api';
import SelectSignatory from 'src/components/header/modals/SelectSignatory.vue';
import { astarChain } from 'src/config/chain';
import { providerEndpoints } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { useAccount, useBreakpoints, useNetworkInfo } from 'src/hooks';
import { useStore } from 'src/store';
import { SubstrateAccount } from 'src/store/general/state';
import { container } from 'src/v2/common';
import { ASTAR_ADDRESS_PREFIX } from 'src/v2/repositories/implementations';
import { Symbols } from 'src/v2/symbols';
import { computed, defineComponent, onUnmounted, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { polkasafeUrl } from 'src/links';
import { SupportMultisig } from 'src/config/wallets';
import { useExtensions } from 'src/hooks/useExtensions';
import { MultisigAddress, Multisig } from 'src/modules/multisig';
import type { InjectedExtension } from '@polkadot/extension-inject/types';

export default defineComponent({
  components: {
    SelectSignatory,
  },
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
    openSelectModal: {
      type: Function,
      required: true,
    },
    disconnectAccount: {
      type: Function,
      required: true,
    },
    currentAccount: {
      type: String,
      required: true,
    },
  },
  emits: ['update:is-open'],
  setup(props, { emit }) {
    const isSelected = ref<boolean>(false);
    const isClosing = ref<boolean>(false);
    const isShowBalance = ref<boolean>(false);
    const isLoadingPolkasafe = ref<boolean>(false);
    const selectedSignatory = ref<SubstrateAccount>();
    const multisigAccounts = ref<MultisigAddress[]>([]);

    const setSelectedSignatory = (account: SubstrateAccount): void => {
      selectedSignatory.value = account;
    };

    const closeModal = async (): Promise<void> => {
      isClosing.value = true;
      const animationDuration = 500;
      await wait(animationDuration);
      isClosing.value = false;
      emit('update:is-open', false);
    };

    const backModal = async (): Promise<void> => {
      await closeModal();
      props.openSelectModal();
    };

    const store = useStore();
    const { t } = useI18n();
    const { multisig } = useAccount();
    const { width, screenSize } = useBreakpoints();
    const { currentNetworkChain, nativeTokenSymbol, currentNetworkIdx } = useNetworkInfo();

    const substrateAccounts = computed<SubstrateAccount[]>(
      () => store.getters['general/substrateAccounts']
    );

    const selectAccount = async (substrateAccount: string): Promise<void> => {
      await props.disconnectAccount();
      isClosing.value = true;
      const animationDuration = 500;
      await wait(animationDuration);
      store.commit('general/setCurrentAddress', substrateAccount);
      localStorage.setItem(LOCAL_STORAGE.SELECTED_WALLET, SupportMultisig.Polkasafe);
      const multisigObj = {
        multisigAccount: multisigAccounts.value.find((it) => it.address === substrateAccount),
        signatory: selectedSignatory.value,
      } as Multisig;
      localStorage.setItem(LOCAL_STORAGE.MULTISIG, JSON.stringify(multisigObj));
      isSelected.value = true;
      isClosing.value = false;
      emit('update:is-open', false);
      window.dispatchEvent(new CustomEvent(LOCAL_STORAGE.SELECTED_WALLET));
    };

    const selAccount = ref<string>('');
    const subScan = computed<string>(
      () => `${providerEndpoints[currentNetworkIdx.value].subscan}/account/`
    );

    const previousSelIdx = computed<number | null>(() => {
      if (substrateAccounts.value && props.currentAccount) {
        const index = substrateAccounts.value.findIndex(
          (it: SubstrateAccount) => it.address === props.currentAccount
        );
        return index;
      } else {
        return null;
      }
    });

    const copyAddress = (address: string): void => {
      copy(address);
      store.dispatch('general/showAlertMsg', {
        msg: t('toast.copyAddressSuccessfully'),
        alertType: 'copied',
      });
    };

    const windowHeight = ref<number>(window.innerHeight);
    const onHeightChange = (): void => {
      const adjustment = width.value > screenSize.sm ? 520 : 390;
      windowHeight.value = window.innerHeight - adjustment;
    };

    window.addEventListener('resize', onHeightChange);
    onHeightChange();

    const displayBalance = (balance: string): number => {
      return truncate(ethers.utils.formatEther(balance || '0'));
    };

    const setMultisigAccounts = async (c: Polkasafe, signatory: string): Promise<void> => {
      const { data, error } = await c.connectAddress(signatory);
      if (error) throw Error(error);
      if (!data.hasOwnProperty('multisigAddresses')) {
        throw Error('error fetching multisig accounts');
      }

      //@ts-ignore
      const filteredMultisigAccounts = data.multisigAddresses.filter((it: MultisigAddress) =>
        isValidAddressPolkadotAddress(it.address, ASTAR_ADDRESS_PREFIX)
      );
      if (filteredMultisigAccounts.length > 0) {
        const updatedAccountMap = await Promise.all(
          filteredMultisigAccounts.map(async (it: MultisigAddress) => {
            const balance = await fetchNativeBalance({
              api: $api as ApiPromise,
              address: it.address,
            });
            return { ...it, balance };
          }) as MultisigAddress[]
        );
        multisigAccounts.value = updatedAccountMap.sort(
          (a: MultisigAddress, b: MultisigAddress) => Number(b.balance) - Number(a.balance)
        );
      }
    };

    const handleInitializePolkasafe = async (signatory: string, injector: any): Promise<void> => {
      const client = new Polkasafe();
      await client.connect('astar', signatory, injector);
      container.addConstant<Polkasafe>(Symbols.PolkasafeClient, client);
      await setMultisigAccounts(client, signatory);
    };

    const handleGetMultisigAccounts = async (): Promise<void> => {
      multisigAccounts.value = [];
      isLoadingPolkasafe.value = true;
      selAccount.value = '';
      if (!selectedSignatory.value || currentNetworkChain.value !== astarChain.ASTAR) {
        return;
      }
      try {
        const extensions = await web3Enable('AstarNetwork/astar-apps');
        const injector = extensions.find((it) => {
          return selectedSignatory.value && it.name === selectedSignatory.value.source;
        }) as InjectedExtension;

        if (!injector) {
          throw Error('injector not found');
        }
        const substratePrefix = 42;
        const signatory = encodeAddress(selectedSignatory.value.address, substratePrefix);

        try {
          const polkasafeClient = container.get<Polkasafe>(Symbols.PolkasafeClient);
          const isSigned = polkasafeClient && polkasafeClient.address === signatory;
          if (isSigned) {
            await setMultisigAccounts(polkasafeClient, signatory);
          } else {
            await handleInitializePolkasafe(signatory, injector);
          }
        } catch (error) {
          // Memo: polkasafeClient has not been initialized
          await handleInitializePolkasafe(signatory, injector);
        }
      } catch (error: any) {
        console.error(error);
        store.dispatch('general/showAlertMsg', {
          msg: error.message,
          alertType: 'error',
        });
      } finally {
        isLoadingPolkasafe.value = false;
      }
    };

    watch(
      [selectedSignatory, substrateAccounts],
      async () => {
        await handleGetMultisigAccounts();
      },
      { immediate: true }
    );

    const setDefaultSelectedSignatory = (): void => {
      if (multisig.value) {
        substrateAccounts.value.length === 0 && useExtensions($api!!, store);
        const account = substrateAccounts.value.find(
          (it) => it.address === multisig.value!.signatory.address
        );
        account && setSelectedSignatory(account);
      }
    };

    watchEffect(setDefaultSelectedSignatory);

    onUnmounted(() => {
      window.removeEventListener('resize', onHeightChange);
    });

    return {
      multisigAccounts,
      selAccount,
      previousSelIdx,
      nativeTokenSymbol,
      windowHeight,
      isSelected,
      isClosing,
      isShowBalance,
      selectedSignatory,
      subScan,
      isLoadingPolkasafe,
      polkasafeUrl,
      copyAddress,
      getShortenAddress,
      closeModal,
      selectAccount,
      displayBalance,
      backModal,
      setSelectedSignatory,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/header/styles/modal-account.scss';
</style>
