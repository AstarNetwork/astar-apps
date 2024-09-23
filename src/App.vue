<template>
  <div>
    <dashboard-layout>
      <router-view v-slot="{ Component }">
        <keep-alive>
          <Suspense>
            <template #default>
              <transition name="route" mode="out-in">
                <component :is="Component"></component>
              </transition>
            </template>
            <template #fallback>
              <modal-loading />
            </template>
          </Suspense>
        </keep-alive>
      </router-view>
    </dashboard-layout>

    <modal-loading v-if="isLoading" />

    <transition name="fade">
      <alert-box
        v-show="showAlert.showAlertMsg"
        :msg="showAlert.alertMsg"
        :alert-type="showAlert.alertType"
      />
    </transition>
    <notification-stack />

    <modal-disclaimer
      v-if="showDisclaimerModal"
      :set-is-open="setShowDisclaimerModal"
      :show="showDisclaimerModal"
    />
  </div>
</template>
<script lang="ts">
// Fix for breaking change introduced in polkadot js v7.x
// https://polkadot.js.org/docs/api/FAQ/#since-upgrading-to-the-7x-series-typescript-augmentation-is-missing
import 'reflect-metadata';
import '@polkadot/api-augment';
import { defineComponent, computed, ref, watch, onMounted } from 'vue';
import DashboardLayout from 'layouts/DashboardLayout.vue';
import { useStore } from 'src/store';
import ModalLoading from 'components/common/ModalLoading.vue';
import AlertBox from 'components/common/AlertBox.vue';
import CookiePolicy from 'components/common/CookiePolicy.vue';
import ModalDisclaimer from 'components/common/ModalDisclaimer.vue';
import ModalOnboarding from 'src/staking-v3/components/ModalOnboarding.vue';
import NotificationStack from './components/common/Notification/NotificationStack.vue';
import 'animate.css';
import {
  BusyMessage,
  ExtrinsicStatusMessage,
  IEventAggregator,
  NewBlockMessage,
} from 'src/v2/messaging';
import { setCurrentWallet } from 'src/v2/app.container';
import { container } from 'src/v2/common';
import { Symbols } from 'src/v2/symbols';
import { useAccount, useAppRouter, useBlockTime } from 'src/hooks';
import { ETHEREUM_EXTENSION } from 'src/modules/account';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import {
  AccountLedgerChangedMessage,
  IDappStakingService,
  ProtocolStateChangedMessage,
} from './staking-v3';
import { useDappStaking, useDapps } from './staking-v3/hooks';
import { IDappStakingRepository as IDappStakingRepositoryV3 } from 'src/staking-v3/logic/repositories';
import { useInflation } from 'src/hooks/useInflation';

export default defineComponent({
  name: 'App',
  components: {
    DashboardLayout,
    ModalLoading,
    AlertBox,
    CookiePolicy,
    ModalDisclaimer,
    NotificationStack,
    ModalOnboarding,
  },
  setup() {
    useAppRouter();
    const store = useStore();
    const { currentAccountName, currentAccount } = useAccount();
    const {
      protocolState,
      getAllRewards,
      getCurrentEraInfo,
      getDappTiers,
      fetchStakerInfoToStore,
      fetchTiersConfigurationToStore,
      fetchEraLengthsToStore,
      isDappStakingV3,
    } = useDappStaking();
    const { fetchStakeAmountsToStore, fetchDappsToStore } = useDapps();
    const { fetchActiveConfigurationToStore, fetchInflationParamsToStore } = useInflation();
    const { fetchBlockTimeToStore } = useBlockTime();
    const isLoading = computed(() => store.getters['general/isLoading']);
    const showAlert = computed(() => store.getters['general/showAlert']);
    const isEthWallet = computed<boolean>(() => store.getters['general/isEthWallet']);
    const currentWallet = computed<string>(() => store.getters['general/currentWallet']);
    const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);

    const showDisclaimerModal = ref<boolean>(false);
    if (!localStorage.getItem(LOCAL_STORAGE.CONFIRM_COOKIE_POLICY)) {
      setTimeout(() => {
        showDisclaimerModal.value = true;
      }, 2000);
    }

    const setShowDisclaimerModal = (isOpen: boolean): void => {
      showDisclaimerModal.value = isOpen;
    };

    // Handle busy and extrinsic call status messages.
    const eventAggregator = container.get<IEventAggregator>(Symbols.EventAggregator);
    eventAggregator.subscribe(ExtrinsicStatusMessage.name, (m) => {
      if (m instanceof ExtrinsicStatusMessage) {
        const message = m as ExtrinsicStatusMessage;
        store.dispatch(
          'general/showAlertMsg',
          {
            msg: message.getMessage(),
            alertType: message.isSuccess() ? 'success' : 'error',
            explorerUrl: message.getExplorerUrl() || '',
          },
          { root: true }
        );
      }
    });

    eventAggregator.subscribe(BusyMessage.name, (m) => {
      const message = m as BusyMessage;
      store.commit('general/setLoading', message.isBusy, { root: true });
    });

    eventAggregator.subscribe(NewBlockMessage.name, (m) => {
      const message = m as NewBlockMessage;
      store.commit('general/setCurrentBlock', message.blockNumber, { root: true });
    });

    // **** dApp staking v3
    // dApp staking v3 data changed subscriptions.
    onMounted(() => {
      if (isDappStakingV3.value) {
        container
          .get<IDappStakingRepositoryV3>(Symbols.DappStakingRepositoryV3)
          .startProtocolStateSubscription();
      }

      fetchBlockTimeToStore();
    });

    eventAggregator.subscribe(ProtocolStateChangedMessage.name, async (m) => {
      const message = m as ProtocolStateChangedMessage;

      if (message.state) {
        console.log('protocol state', message.state);
        store.commit('stakingV3/setProtocolState', message.state, { root: true });
        await fetchDappsToStore();
        await Promise.all([
          getAllRewards(),
          getCurrentEraInfo(),
          getDappTiers(message.state.era - 1),
          fetchStakeAmountsToStore(),
          fetchStakerInfoToStore(),
          fetchEraLengthsToStore(),
          fetchActiveConfigurationToStore(),
          fetchInflationParamsToStore(),
        ]);
      }
    });

    eventAggregator.subscribe(AccountLedgerChangedMessage.name, (m) => {
      const message = m as AccountLedgerChangedMessage;
      if (message.ledger) {
        store.commit('stakingV3/setLedger', message.ledger, { root: true });
        console.log('ledger', message.ledger);
      }
    });
    // **** end dApp staking v3

    // Handle wallet change so we can inject proper wallet
    let previousAddress: string | undefined = undefined;
    watch([isEthWallet, currentWallet, isH160, currentAccountName], async () => {
      const isLockdropAccount = !isH160.value && currentAccountName.value === ETHEREUM_EXTENSION;
      setCurrentWallet(isEthWallet.value, currentWallet.value, isLockdropAccount);

      // Subscribe to an account specific dApp staking v3 data.
      if (!isDappStakingV3.value) return;

      // Memo: Can't use senderSs58Account here because unified account is not stored to vuex yet
      // and senderSs58Account contains evm mapped address which is incorrect for unified account.
      if (currentAccount.value && currentAccount.value !== previousAddress) {
        const stakingService = container.get<() => IDappStakingService>(
          Symbols.DappStakingServiceFactoryV3
        )();
        await stakingService.startAccountLedgerSubscription(currentAccount.value);
        fetchStakerInfoToStore();
        getAllRewards();
        fetchTiersConfigurationToStore();
        getDappTiers((protocolState.value?.era ?? 0) - 1);

        previousAddress = currentAccount.value;
      }
    });

    const removeSplashScreen = () => {
      var elem = document.getElementById('splash');
      elem?.remove();
    };

    removeSplashScreen();

    return {
      isLoading,
      showAlert,
      showDisclaimerModal,
      setShowDisclaimerModal,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';
.bg-black-alt {
  background: #191919;
}
.text-black-alt {
  color: #191919;
}
.border-black-alt {
  border-color: #191919;
}

.route-enter-from {
  opacity: 0;
  transform: translateX(50px);
}

.route-enter-active {
  transition: all 0.3s ease-out;
}

.route-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}

.route-leave-active {
  transition: all 0.3s ease-in;
}
</style>
