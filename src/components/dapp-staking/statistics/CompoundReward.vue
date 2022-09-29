<template>
  <div v-if="isSupported" class="widget-container">
    <div class="title">
      <span class="pillBox">New</span>
      {{ $t('dappStaking.compound') }}
      <IconTooltip>
        {{ $t('dappStaking.autoCompoundingTooltip') }}
      </IconTooltip>
    </div>
    <div class="widget-content">
      <span class="text--title">
        {{ $t('dappStaking.claimAndRestake') }}
      </span>
      <Button :small="true" :primary="true" class="button" @click="showAutoCompound">{{
        $t('dappStaking.change')
      }}</Button>
    </div>
    <div class="tw-p-4">
      <ModalAutoCompound
        v-if="showAutoCompoundModal"
        v-model:is-open="showAutoCompoundModal"
        :change-destination="changeDestination"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { farQuestionCircle } from '@quasar/extras/fontawesome-v5';
import { useCompoundRewards, RewardDestination } from 'src/hooks/dapps-staking/useCompoundRewards';
import ModalAutoCompound from 'components/dapp-staking/modals/ModalAutoCompound.vue';
import Button from 'components/common/Button.vue';
import IconTooltip from 'components/common/IconTooltip.vue';

export default defineComponent({
  components: {
    Button,
    IconTooltip,
    ModalAutoCompound,
  },
  setup() {
    const { isSupported, isCompounding, setRewardDestination } = useCompoundRewards();
    const showAutoCompoundModal = ref<boolean>(false);

    const showAutoCompound = (): void => {
      showAutoCompoundModal.value = true;
    };

    const changeDestination = async () => {
      const newDestination = isCompounding.value
        ? RewardDestination.FreeBalance
        : RewardDestination.StakeBalance;
      await setRewardDestination(newDestination);
    };

    return {
      showAutoCompound,
      showAutoCompoundModal,
      isSupported,
      isCompounding,
      changeDestination,
      farQuestionCircle,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dapp-staking/styles/user-rewards-widget.scss';
</style>
