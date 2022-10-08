<template>
  <div v-if="dapp" class="wrapper--dapp-avatar">
    <div class="column--avatar">
      <div>
        <img class="image--dapp-icon" :src="dapp.dapp.iconUrl" :alt="dapp.dapp.name" />
      </div>
      <div class="column--details">
        <div class="row--dapp-title">
          <span class="text--xl">{{ dapp.dapp.name }}</span>
        </div>
        <div v-if="dapp.dapp.tags" class="row--tags">
          <div v-for="tag in dapp.dapp.tags" :key="tag" class="tag">
            <span class="text--tag"> {{ tag }} </span>
          </div>
        </div>
        <div class="row--stake">
          <astar-button class="btn-size--stake">
            <span class="text--btn-stake">
              {{ $t('dappStaking.stake') }}
            </span>
          </astar-button>
        </div>
      </div>
    </div>
    <div class="column--edit">
      <astar-button class="btn-size--stake">
        <span class="text--btn-stake">
          {{ $t('dappStaking.edit') }}
        </span>
      </astar-button>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    dapp: {
      type: Object,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dapp-staking/dapp/styles/dapp-avatar.scss';
</style>
