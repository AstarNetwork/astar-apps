<template>
  <div class="wrapper--cards">
    <div class="card">
      <p>
        {{ $t('myReward.totalStaked') }}
        <span class="wrapper--icon-help">
          <astar-icon-help size="16" />
        </span>
        <q-tooltip>
          <span class="text--tooltip">{{ $t('myReward.totalStaked') }}</span>
        </q-tooltip>
      </p>
      <div class="row--data">
        <div v-if="isLoading" class="loading">
          <q-skeleton type="rect" animation="fade" />
        </div>
        <div v-else class="value">
          <TokenBalance :balance="item.totalStaked.toString()" symbol="ASTR" />
        </div>
      </div>
    </div>
    <div class="card">
      <p>
        {{ $t('myReward.availableToClaim') }}
        <span class="wrapper--icon-help">
          <astar-icon-help size="16" />
        </span>
        <q-tooltip>
          <span class="text--tooltip">{{ $t('myReward.availableToClaim') }}</span>
        </q-tooltip>
      </p>
      <div class="row--data">
        <div v-if="isLoading" class="loading">
          <q-skeleton type="rect" animation="fade" />
        </div>
        <div v-else class="value">{{ item.availableEra }} {{ $t('myReward.era') }}</div>
        <astar-button width="80" height="24">{{ $t('myReward.claim') }}</astar-button>
      </div>
    </div>
    <div class="card">
      <p>
        {{ $t('myReward.restake') }}
        <span class="wrapper--icon-help">
          <astar-icon-help size="16" />
        </span>
        <q-tooltip>
          <span class="text--tooltip">{{ $t('myReward.restake') }}</span>
        </q-tooltip>
      </p>
      <div class="row--data">
        <div class="value">ON</div>
        <astar-button width="80" height="24">{{ $t('myReward.turnOff') }}</astar-button>
      </div>
    </div>
    <div class="card">
      <p>
        {{ $t('myReward.totalEarned') }}
        <span class="wrapper--icon-help">
          <astar-icon-help size="16" />
        </span>
        <q-tooltip>
          <span class="text--tooltip">{{ $t('myReward.totalEarned') }}</span>
        </q-tooltip>
      </p>
      <div class="row--data">
        <div v-if="isLoading" class="loading">
          <q-skeleton type="rect" animation="fade" />
        </div>
        <div v-else class="value">{{ item.totalEarned.toLocaleString() }} ASTR</div>
        <astar-irregular-button>
          <div class="explorer-icon">
            <astar-icon-external-link />
          </div>
        </astar-irregular-button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import TokenBalance from 'src/components/common/TokenBalance.vue';

export default defineComponent({
  components: {
    TokenBalance,
  },
  setup() {
    const item = {
      totalStaked: 500000,
      availableEra: 5,
      totalEarned: 10000,
    };
    const isLoading = ref(true);

    return {
      item,
      isLoading,
    };
  },
});
</script>
<style lang="scss" scoped>
@import './styles/my-rewards.scss';
</style>