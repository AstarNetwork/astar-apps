<template>
  <Modal title="Vesting info" @click="closeModal">
    <template #content>
      <div class="tw-w-96">
        <div class="tw-flex tw-space-x-2 tw-text-xl">
          <b><format-balance :balance="accountData.vestedClaimable" /></b>
          <span>{{ $t('balance.modals.availableToUnlock') }}</span>
        </div>
        <q-scroll-area class="scroll">
          <hr class="tw-my-4" />
          <div v-for="(vestingInfo, index) in accountData.vesting" :key="index">
            <div class="tw-flex tw-space-x-2">
              <b><format-balance :balance="vestingInfo.vested" /></b>
              <span>{{ $t('balance.modals.of') }}</span>
              <format-balance :balance="vestingInfo.basicInfo.locked" />
              <span>{{ $t('balance.modals.vested') }}</span>
            </div>
            <div class="tw-flex tw-space-x-2">
              <b>
                <format-balance :balance="vestingInfo.basicInfo.locked.sub(vestingInfo.vested)" />
              </b>
              <span>{{ $t('balance.remainingVests') }}</span>
            </div>
            <div class="tw-flex tw-space-x-2">
              <b><format-balance :balance="vestingInfo.basicInfo.perBlock" /></b>
              <span>{{ $t('balance.modals.perBlock') }}</span>
            </div>
            <div>
              {{ $t('balance.modals.untilBlock') }} {{ getUntilBlock(vestingInfo.basicInfo) }}
            </div>
            <hr class="tw-my-4" />
          </div>
        </q-scroll-area>
        <div class="tw-mt-6 tw-flex tw-justify-center tw-flex-row">
          <Button :disabled="!canUnlockVestedTokens" @click="unlockFunction()">
            {{ $t('balance.unlockVestedTokens') }}
          </Button>
          <Button type="button" :primary="false" @click="closeModal">{{ $t('close') }}</Button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script lang="ts">
import { defineComponent, PropType, toRefs, computed } from 'vue';
import { VestingInfo } from '@polkadot/types/interfaces';
import { balanceFormatter } from 'src/hooks/helper/plasmUtils';
import { AccountData } from 'src/hooks';
import Modal from 'src/components/common/Modal.vue';
import Button from 'src/components/common/Button.vue';
import FormatBalance from 'components/balance/FormatBalance.vue';
import BN from 'bn.js';

export default defineComponent({
  components: {
    Modal,
    Button,
    FormatBalance,
  },
  props: {
    accountData: {
      type: Object as PropType<AccountData>,
      required: true,
    },
    unlockFunction: {
      type: Function,
      required: true,
    },
  },
  emits: ['update:is-open'],
  setup(props, { emit }) {
    const closeModal = () => {
      emit('update:is-open', false);
    };

    const getUntilBlock = (vesting: VestingInfo): BN => {
      return vesting.locked.div(vesting.perBlock).add(vesting.startingBlock);
    };

    const canUnlockVestedTokens = computed(() => props.accountData.vestedClaimable.gtn(0));

    return {
      closeModal,
      getUntilBlock,
      canUnlockVestedTokens,
      balanceFormatter,
      ...toRefs(props),
    };
  },
});
</script>

<style lang="scss" scoped>
.scroll {
  height: 300px;
}
</style>
