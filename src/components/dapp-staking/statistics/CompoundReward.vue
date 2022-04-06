<template>
  <div v-if="isSupported">
    <div class="title">
      Auto Compound
      <q-icon :name="fasQuestionCircle" color="grey" />
    </div>
    <div>
      <span class="text--title">{{ isCompounding ? 'ON' : 'OFF' }}</span>
      <Button :small="true" :primary="true" class="button" @click="changeDestination">
        {{ isCompounding ? 'Turn off' : 'Turn on' }}
      </Button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { fasQuestionCircle } from '@quasar/extras/fontawesome-v5';
import { useCompoundRewards, RewardDestination } from 'src/hooks/dapps-staking/useCompoundRewards';
import Button from 'components/common/Button.vue';

export default defineComponent({
  components: {
    Button,
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
      fasQuestionCircle,
    };
  },
});
</script>

<style scoped>
.button {
  float: right;
}

.title {
  margin-bottom: 12px;
}
</style>
