<template>
  <Modal :title="`Claim reward ${dapp.name}`" @click="closeModal">
    <template #content>
      <Avatar :url="dapp.iconUrl" class="tw-w-36 tw-h-36 tw-mb-4 tw-mx-auto" />
      <div v-if="stakeInfo?.totalStake" class="tw-mt-4">
        <span class="tw-w-52 tw-inline-block">{{ $t('dappStaking.totalStake') }}</span>
        <span class="tw-font-semibold">{{ stakeInfo.totalStake }}</span>
      </div>
      <div v-if="stakeInfo?.yourStake" class="tw-mt-2">
        <span class="tw-w-52 tw-inline-block">{{ $t('dappStaking.yourStake') }}</span>
        <span class="tw-font-semibold">{{ stakeInfo.yourStake.formatted }}</span>
      </div>
      <div class="tw-mt-2">
        <span class="tw-w-52 tw-inline-block">
          {{ $t('dappStaking.modals.estimatedRewards') }}</span
        >
        <span class="tw-font-semibold tw-w-16 tw-text-rigth">{{ pendingRewards }}</span>
      </div>
      <div v-if="claimedRewards > 0" class="tw-mt-2">
        <span class="tw-w-52 tw-inline-block">
          {{ $t('dappStaking.modals.estimatedClaimedRewards') }}
        </span>
        <span class="tw-font-semibold tw-w-16 tw-text-rigth">{{ claimedRewards }}</span>
      </div>
      <div v-if="!isEnableIndividualClaim" class="tw-mt-2">
        <span class="tw-w-52 tw-inline-block"> {{ $t('dappStaking.modals.unclaimedEras') }}</span>
        <span class="tw-font-semibold tw-w-16 tw-text-rigth">{{
          claimInfo?.unclaimedEras?.length
        }}</span>
      </div>
      <div v-if="stepsCount > 1" class="tw-mt-4">
        {{ $t('dappStaking.modals.multipleClaimInfo', { steps: stepsCount }) }}
      </div>
      <div class="tw-mt-6 tw-flex tw-justify-center tw-flex-row">
        <Button type="button" :primary="false" @click="closeModal">{{ $t('close') }}</Button>
        <!-- <Button :disabled="!canClaim" class="tw-tooltip" @click="claim()"> -->
        <!-- Todo: add the :disabled -->
        <Button class="tw-tooltip" @click="claim()">
          {{ $t('dappStaking.claim') }}
        </Button>
      </div>
    </template>
  </Modal>
</template>

<script lang="ts">
import { defineComponent, toRefs, onMounted, ref, computed } from 'vue';
import { $api } from 'boot/api';
import { useStore } from 'src/store';
import { useChainMetadata, useIndividualClaim } from 'src/hooks';
import Modal from 'src/components/common/Modal.vue';
import Button from 'src/components/common/Button.vue';
import Avatar from 'src/components/common/Avatar.vue';
import { StakingParameters, ClaimInfo } from 'src/store/dapp-staking/actions';
import { balanceFormatter } from 'src/hooks/helper/plasmUtils';
import { isEnableIndividualClaim } from 'src/config/chainEndpoints';

export default defineComponent({
  components: {
    Modal,
    Button,
    Avatar,
  },
  props: {
    dapp: {
      type: Object,
      required: true,
    },
    claimAction: {
      type: Function,
      required: true,
    },
    stakeInfo: {
      type: Object,
      required: true,
    },
  },
  emits: ['update:is-open'],
  setup(props, { emit }) {
    const maxErasPerClaim = 15;
    const store = useStore();
    const { decimal } = useChainMetadata();
    const { individualClaim } = useIndividualClaim(props.dapp.address);
    const claimInfo = ref<ClaimInfo>();
    const pendingRewards = ref<string>('');
    const claimedRewards = ref<string>('');
    const senderAddress = store.getters['general/selectedAddress'];
    const stepsCount = ref<number>(1);
    const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);

    const canClaim = computed(() => {
      return isEnableIndividualClaim
        ? Number(claimInfo.value ? claimInfo.value.rewards.toString() : '0') > 0
        : claimInfo?.value && claimInfo.value.unclaimedEras.length > 0;
    });

    onMounted(async () => {
      await getClaimInfo();
    });

    const getClaimInfo = async () => {
      // Todo: resolve error
      claimInfo.value = await store.dispatch('dapps/getClaimInfo', {
        api: $api?.value,
        senderAddress,
        dapp: props.dapp,
        decimals: decimal.value,
        substrateAccounts: substrateAccounts.value,
      } as StakingParameters);
      if (!claimInfo.value) return;

      pendingRewards.value = balanceFormatter(claimInfo.value.rewards.toString());
      claimedRewards.value = balanceFormatter(claimInfo.value.estimatedClaimedRewards.toString());
      stepsCount.value = Math.ceil(claimInfo.value.unclaimedEras.length / maxErasPerClaim);
    };

    const closeModal = () => {
      emit('update:is-open', false);
    };

    const claim = async () => {
      if (isEnableIndividualClaim) {
        await individualClaim();
      } else {
        const erasToClaim = claimInfo.value?.unclaimedEras.sort().slice(0, maxErasPerClaim);
        console.log('Eras to claim in batch', erasToClaim);
        await props.claimAction(erasToClaim, getClaimInfo);
      }
    };

    return {
      pendingRewards,
      claimedRewards,
      claimInfo,
      canClaim,
      closeModal,
      stepsCount,
      claim,
      isEnableIndividualClaim,
      ...toRefs(props),
    };
  },
});
</script>
