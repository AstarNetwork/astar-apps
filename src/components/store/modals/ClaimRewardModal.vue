<template>
  <Modal :title="`Claim reward ${dapp.name}`">
    <template #content>
      <Avatar :url="dapp.iconUrl" class="tw-w-36 tw-h-36 tw-mb-4 tw-mx-auto" />
      <div class="tw-mt-4">
        <span class="tw-w-52 tw-inline-block">{{ $t('store.totalStake') }}</span>
        <span class="tw-font-semibold">{{ stakeInfo.totalStake }}</span>
      </div>
      <div v-if="stakeInfo.yourStake" class="tw-mt-2">
        <span class="tw-w-52 tw-inline-block">{{ $t('store.yourStake') }}</span>
        <span class="tw-font-semibold">{{ stakeInfo.yourStake }}</span>
      </div>
      <div class="tw-mt-2">
        <span class="tw-w-52 tw-inline-block"> {{ $t('store.modals.estimatedRewards') }}</span>
        <span class="tw-font-semibold tw-w-16 tw-text-rigth">{{
          claimInfo?.rewards.toHuman()
        }}</span>
      </div>
      <div class="tw-mt-2">
        <span class="tw-w-52 tw-inline-block"> {{ $t('store.modals.unclaimedEras') }}</span>
        <span class="tw-font-semibold tw-w-16 tw-text-rigth">{{
          claimInfo?.unclaimedEras?.length
        }}</span>
      </div>
    </template>
    <template #buttons>
      <Button :disabled="!canClaim" class="tw-tooltip" @click="claimAction()">
        {{ $t('store.claim') }}
      </Button>
    </template>
  </Modal>
</template>

<script lang="ts">
import { defineComponent, toRefs, onMounted, ref, computed } from 'vue';
import { useApi } from 'src/hooks';
import { useStore } from 'src/store';
import { useChainMetadata } from 'src/hooks';
import Modal from 'src/components/common/Modal.vue';
import Button from 'src/components/common/Button.vue';
import Avatar from 'src/components/common/Avatar.vue';
import { StakingParameters, ClaimInfo } from 'src/store/dapps-store/actions';

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
  setup(props) {
    const { api } = useApi();
    const store = useStore();
    const { decimal } = useChainMetadata();
    const claimInfo = ref<ClaimInfo>();
    const senderAddress = store.getters['general/selectedAccountAddress'];

    const canClaim = computed(() => {
      return claimInfo?.value && claimInfo.value.unclaimedEras.length > 0;
    });

    onMounted(async () => {
      claimInfo.value = await store.dispatch('dapps/getClaimInfo', {
        api: api?.value,
        senderAddress,
        dapp: props.dapp,
        decimals: decimal.value,
      } as StakingParameters);
    });

    return {
      claimInfo,
      canClaim,
      ...toRefs(props),
    };
  },
});
</script>
