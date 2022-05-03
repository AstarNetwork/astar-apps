<template>
  <div v-if="canUnbondWithdraw">
    <div v-if="showUnbondedFunds" class="widget-container full-height">
      <div class="title">
        {{ $t('dappStaking.unbondedFunds') }}
        <IconTooltip>
          {{ $t('dappStaking.unbondedFundsTooltip') }}
        </IconTooltip>
      </div>
      <div class="widget-content">
        <span class="text--title balance">
          <FormatBalance :balance="totalToWithdraw" />
        </span>
        <Button v-if="canWithdraw" :small="true" :primary="true" class="button" @click="withdraw()">
          {{ $t('dappStaking.withdraw') }}
        </Button>
      </div>
    </div>
    <div v-if="showUnbondingChunks" class="widget-container full-height">
      <div class="title">
        {{ $t('dappStaking.chunks') }}
        <IconTooltip>
          {{
            $t('dappStaking.chunksTooltip', {
              era: unbondingPeriod,
              chunks: unlockingChunksCount,
            })
          }}
        </IconTooltip>
      </div>
      <div class="widget-content">
        <span class="text--title balance">
          {{ unlockingChunks?.length }}
        </span>
        <Button
          v-if="unlockingChunks?.length > 0"
          :small="true"
          :primary="true"
          class="button"
          @click="showModal = true"
        >
          {{ $t('dappStaking.view') }}
        </Button>
      </div>
    </div>
    <ChunksModal
      v-if="showModal"
      v-model:isOpen="showModal"
      :unlocking-chunks="unlockingChunks"
      :max-unlocking-chunks="maxUnlockingChunks"
    />
  </div>
</template>

<script lang="ts">
import { VoidFn } from '@polkadot/api/types';
import { u32 } from '@polkadot/types';
import { Balance, EraIndex } from '@polkadot/types/interfaces';
import { Codec, ISubmittableResult } from '@polkadot/types/types';
import BN from 'bn.js';
import { $api } from 'boot/api';
import FormatBalance from 'components/common/FormatBalance.vue';
import IconTooltip from 'components/common/IconTooltip.vue';
import Button from 'src/components/common/Button.vue';
import { useCustomSignature } from 'src/hooks';
import { signAndSend } from 'src/hooks/helper/wallet';
import { useUnbondWithdraw } from 'src/hooks/useUnbondWithdraw';
import { hasExtrinsicFailedEvent } from 'src/modules/extrinsic';
import { useStore } from 'src/store';
import { computed, defineComponent, onUnmounted, ref, watch } from 'vue';
import ChunksModal from './ChunksModal.vue';

export default defineComponent({
  components: {
    Button,
    FormatBalance,
    ChunksModal,
    IconTooltip,
  },
  props: {
    showUnbondedFunds: {
      type: Boolean,
      default: true,
    },
    showUnbondingChunks: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const store = useStore();
    const { isCustomSig, handleCustomExtrinsic } = useCustomSignature({
      fn: () => {
        store.commit('dapps/setUnlockingChunks', -1);
      },
    });
    const selectedAccountAddress = computed(() => store.getters['general/selectedAddress']);
    const unlockingChunksCount = computed(() => store.getters['dapps/getUnlockingChunks']);
    const maxUnlockingChunks = computed(() => store.getters['dapps/getMaxUnlockingChunks']);
    const unbondingPeriod = computed(() => store.getters['dapps/getUnbondingPeriod']);
    const unlockingChunks = ref<ChunkInfo[]>();
    const canWithdraw = ref<boolean>(false);
    const totalToWithdraw = ref<BN>(new BN(0));
    const showModal = ref<boolean>(false);
    const { canUnbondWithdraw } = useUnbondWithdraw($api);
    const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);

    const withdraw = async (): Promise<void> => {
      try {
        const apiRef = $api.value;
        if (!apiRef) {
          throw Error('Cannot connect to the API');
        }
        const transaction = apiRef.tx.dappsStaking.withdrawUnbonded();
        const txResHandler = (result: ISubmittableResult) => {
          if (result.status.isFinalized) {
            if (!hasExtrinsicFailedEvent(result.events, store.dispatch)) {
              store.commit('dapps/setUnlockingChunks', -1);
              store.dispatch('general/showAlertMsg', {
                msg: 'Balance is sucessfully withdrawed.',
                alertType: 'success',
              });
            }

            store.commit('general/setLoading', false);
          } else {
            store.commit('general/setLoading', true);
          }
        };

        await signAndSend({
          transaction,
          senderAddress: selectedAccountAddress.value,
          substrateAccounts: substrateAccounts.value,
          isCustomSignature: isCustomSig.value,
          txResHandler,
          handleCustomExtrinsic,
          dispatch: store.dispatch,
        });
      } catch (error) {
        console.error(error);
      }
    };

    const subscribeToEraChange = async (): Promise<VoidFn | undefined> => {
      const unsub = (await $api?.value?.query.dappsStaking.currentEra(async (era: u32) => {
        await getChunks(era);
      })) as VoidFn | undefined;

      return unsub;
    };

    const unsub = subscribeToEraChange();

    const getChunks = async (era: u32) => {
      if (!canUnbondWithdraw.value) {
        return;
      }

      const ledger = await $api?.value?.query.dappsStaking.ledger<PalletDappsStakingAccountLedger>(
        selectedAccountAddress.value
      );

      if (ledger?.unbondingInfo.unlockingChunks) {
        unlockingChunks.value = ledger.unbondingInfo.unlockingChunks;
        store.commit('dapps/setUnlockingChunks', unlockingChunks.value?.length);
        canWithdraw.value = false;
        totalToWithdraw.value = new BN(0);
        for (const chunk of unlockingChunks.value) {
          const erasBeforeUnlock = era.sub(chunk.unlockEra.toBn()).toNumber();
          chunk.erasBeforeUnlock = Math.abs(erasBeforeUnlock > 0 ? 0 : erasBeforeUnlock);

          if (erasBeforeUnlock >= 0) {
            totalToWithdraw.value = totalToWithdraw.value.add(chunk.amount.toBn());
          }

          if (!canWithdraw.value) {
            canWithdraw.value = chunk.erasBeforeUnlock === 0;
          }
        }
      }
    };

    watch(
      () => unlockingChunksCount.value,
      async (chunks) => {
        console.log('chunks count changed');
        const era = await $api?.value?.query.dappsStaking.currentEra<u32>();
        if (era) {
          await getChunks(era);
        }
      }
    );

    onUnmounted(async () => {
      const unsubFn = await unsub;
      if (unsubFn) {
        unsubFn();
      }
    });

    return {
      unlockingChunks,
      canWithdraw,
      withdraw,
      totalToWithdraw,
      showModal,
      maxUnlockingChunks,
      canUnbondWithdraw,
      unlockingChunksCount,
      unbondingPeriod,
    };
  },
});

interface PalletDappsStakingAccountLedger extends Codec {
  unbondingInfo: UnbondingInfo;
}

interface UnbondingInfo {
  unlockingChunks: ChunkInfo[];
}

export interface ChunkInfo extends Codec {
  amount: Balance;
  unlockEra: EraIndex;
  erasBeforeUnlock: number;
}
</script>

<style lang="scss" scoped>
@use 'src/components/dapp-staking/styles/user-rewards-widget.scss';

.balance {
  float: left;
}

.full-height {
  height: 100%;
}
</style>
