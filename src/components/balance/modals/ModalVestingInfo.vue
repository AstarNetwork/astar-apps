<template>
  <Modal title="Vesting info" @click="closeModal">
    <template #content>
      <div class="tw-w-96">
        <hr class="tw-mb-4" />
        <div v-for="(vestingInfo, index) in accountData.vesting" :key="index">
          <div class="tw-flex tw-space-x-2">
            <b><format-balance :balance="vestingInfo.vested" /></b>
            <span>of</span>
            <format-balance :balance="vestingInfo.basicInfo.locked" />
            <span>vested</span>
          </div>
          <div class="tw-flex tw-space-x-2">
            <b><format-balance :balance="vestingInfo.basicInfo.perBlock" /></b>
            <span>per block</span>
          </div>
          <div>until block {{ getUntilBlock(vestingInfo.basicInfo) }}</div>
          <hr class="tw-my-4" />
        </div>
        <div class="tw-mt-6 tw-flex tw-justify-center tw-flex-row">
          <Button type="button" :primary="false" @click="closeModal">{{ $t('close') }}</Button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script lang="ts">
import { defineComponent, PropType, toRefs } from 'vue';
import { PalletVestingVestingInfo } from '@polkadot/types/lookup';
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
  },
  emits: ['update:is-open'],
  setup(props, { emit }) {
    const closeModal = () => {
      emit('update:is-open', false);
    };

    const getUntilBlock = (vesting: PalletVestingVestingInfo): BN => {
      return vesting.locked.div(vesting.perBlock).add(vesting.startingBlock);
    };

    return {
      closeModal,
      getUntilBlock,
      ...toRefs(props),
    };
  },
});
</script>
