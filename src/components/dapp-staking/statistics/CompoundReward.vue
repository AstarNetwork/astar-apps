<template>
  <div v-if="isSupported">
    <div class="title">
      {{ $t('dappStaking.autoCompound') }}
      <IconTooltip>
        {{ $t('dappStaking.autoCompoundingTooltip') }}
      </IconTooltip>
    </div>
    <div>
      <span class="text--title">{{ isCompounding ? 'ON' : 'OFF' }}</span>
      <Button :small="true" :primary="true" class="button" @click="changeDestination">
        {{ isCompounding ? $t('dappStaking.turnOff') : $t('dappStaking.turnOn') }}
      </Button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { farQuestionCircle } from '@quasar/extras/fontawesome-v5';
import { useCompoundRewards, RewardDestination } from 'src/hooks/dapps-staking/useCompoundRewards';
import Button from 'components/common/Button.vue';
import IconTooltip from 'components/common/IconTooltip.vue';

export default defineComponent({
  components: {
    Button,
    IconTooltip,
  },
  setup() {
    const { isSupported, isCompounding, setRewardDestination } = useCompoundRewards();

    const changeDestination = async () => {
      const newDestination = isCompounding.value
        ? RewardDestination.FreeBalance
        : RewardDestination.StakeBalance;
      await setRewardDestination(newDestination);
    };

    return {
      isSupported,
      isCompounding,
      changeDestination,
      farQuestionCircle,
    };
  },
});
</script>

<style scoped>
.button {
  float: right;
}

.title {
  font-size: 16px;
  margin-bottom: 12px;
  display: flex;
}
</style>
