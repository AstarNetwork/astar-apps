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
      <div class="tw-mt-2">
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
        <Button :disabled="!canClaim" class="tw-tooltip" @click="claim()">
          {{ $t('dappStaking.claim') }}
        </Button>
      </div>
    </template>
  </Modal>
</template>

<script lang="ts">
import { $api, $isEnableIndividualClaim } from 'boot/api';
import Avatar from 'src/components/common/Avatar.vue';
import Button from 'src/components/common/Button.vue';
import Modal from 'src/components/common/Modal.vue';
import { useChainMetadata } from 'src/hooks';
import { balanceFormatter } from 'src/hooks/helper/plasmUtils';
import { useStore } from 'src/store';
import { ClaimInfo, StakingParameters } from 'src/store/dapp-staking/actions';
import { computed, defineComponent, onMounted, ref, toRefs } from 'vue';

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
    const claimInfo = ref<ClaimInfo>();
    const pendingRewards = ref<string>('');
    const claimedRewards = ref<string>('');
    const senderAddress = store.getters['general/selectedAddress'];
    const stepsCount = ref<number>(1);
    const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);

    const canClaim = computed(() => {
      return (
        !$isEnableIndividualClaim.value &&
        claimInfo?.value &&
        claimInfo.value.unclaimedEras.length > 0
      );
    });

    onMounted(async () => {
      await getClaimInfo();
    });

    const getClaimInfo = async () => {
      claimInfo.value = await store.dispatch('dapps/getClaimInfo', {
        api: $api,
        senderAddress,
        dapp: props.dapp,
        decimals: decimal.value,
        substrateAccounts: substrateAccounts.value,
        isEnableIndividualClaim: $isEnableIndividualClaim.value,
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
      if (!$isEnableIndividualClaim.value) {
        const erasToClaim = claimInfo.value?.unclaimedEras.sort().slice(0, maxErasPerClaim);
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
      ...toRefs(props),
    };
  },
});
</script>
