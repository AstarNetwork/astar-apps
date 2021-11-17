<template>
  <Modal :title="title">
    <template #content>
      <Avatar :url="dapp.iconUrl" class="tw-w-36 tw-h-36 tw-mb-4 tw-mx-auto" />
      <div class="tw-mb-4">
        <label
          class="
            tw-block tw-text-sm tw-font-medium tw-text-gray-500
            dark:tw-text-darkGray-400
            tw-mb-2
          "
          >{{ $t('store.modals.address') }}</label
        >
        <ModalSelectAccount
          v-model:selAddress="data.address"
          :all-accounts="allAccounts"
          :all-account-names="allAccountNames"
          @sel-changed="reloadAmount"
        />
      </div>
      <div>
        <q-card class="dark:tw-bg-transparent">
          <q-tabs v-model="tab">
            <q-tab name="unbond" label="Unbond" />
            <q-tab name="unstake" label="Unstake and withdraw" />
          </q-tabs>
          <q-separator />
          <q-tab-panels v-model="tab" class="tw-bg-transparent">
            <q-tab-panel name="unbond">
              <div class="tw-mb-4">Unbonding period</div>
              <InputAmount
                v-model:amount="data.amount"
                v-model:selectedUnit="data.unit"
                title="Amount"
              />
              <div v-if="accountData" class="tw-mt-1 tw-ml-1">
                {{ $t('store.yourStake') }}
                <format-balance :balance="stakeAmount" class="tw-inline tw-font-semibold" />
              </div>
              <Button class="tw-my-4 tw-float-right">
                {{ $t('store.modals.startUnbonding') }}
              </Button>
            </q-tab-panel>
            <q-tab-panel name="unstake">
              <div>{{ $t('store.modals.chunks') }}</div>
              <q-card class="dark:tw-bg-transparent tw-p-4 tw-mt-1">
                <div class="row tw-py-2">
                  <div class="col">120 SDN</div>
                  <div class="col">can unstake</div>
                </div>
                <div class="row tw-py-2">
                  <div class="col">150 SDN</div>
                  <div class="col">3 eras to unstake</div>
                </div>
              </q-card>
              <Button class="tw-my-4 tw-float-right">
                {{ $t('store.unstake') }}
              </Button>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>
    </template>
  </Modal>
</template>

<script lang="ts">
import { ref, toRefs, computed, defineComponent, PropType } from 'vue';
import { useAccount, useApi, useBalance, useChainMetadata } from 'src/hooks';
import { useStore } from 'src/store';
import Modal from 'components/common/Modal.vue';
import { DappItem } from 'src/store/dapps-store/state';
import Avatar from 'src/components/common/Avatar.vue';
import ModalSelectAccount from 'components/balance/modals/ModalSelectAccount.vue';
import InputAmount from 'src/components/common/InputAmount.vue';
import Button from 'src/components/common/Button.vue';
import { StakeModel } from 'src/hooks/store';

export default defineComponent({
  components: {
    Modal,
    Avatar,
    ModalSelectAccount,
    InputAmount,
    Button,
  },
  props: {
    dapp: {
      type: Object as PropType<DappItem>,
      required: true,
    },
  },
  setup(props) {
    const title = ref<String>('');
    const tab = ref<String>('unbond');
    const { decimal, defaultUnitToken } = useChainMetadata();
    const { currentAccount } = useAccount();
    const { api } = useApi();
    const { accountData } = useBalance(api, currentAccount);
    const store = useStore();

    title.value = `Unstake from ${props.dapp.name}`;
    const allAccounts = computed(() => store.getters['general/allAccounts']);
    const allAccountNames = computed(() => store.getters['general/allAccountNames']);
    const data = ref<StakeModel>({
      address: '',
      amount: 0,
      unit: defaultUnitToken.value,
      decimal: decimal.value,
    } as StakeModel);

    const reloadAmount = (
      address: string,
      isMetamaskChecked: boolean,
      selAccountIdx: number
    ): void => {
      store.commit('general/setIsCheckMetamask', isMetamaskChecked);
      store.commit('general/setCurrentAccountIdx', selAccountIdx);
    };

    return {
      title,
      tab,
      data,
      allAccounts,
      allAccountNames,
      accountData,
      reloadAmount,
      ...toRefs(props),
    };
  },
});
</script>
