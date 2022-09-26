<template>
  <div class="wrapper--cards">
    <div class="card">
      <p>
        Total Staked
        <span class="wrapper--icon-help">
          <astar-icon-help size="16" />
        </span>
        <q-tooltip>
          <span class="text--tooltip">Total Staked</span>
        </q-tooltip>
      </p>
      <div class="row--data">
        <div class="value">500,000 ASTR</div>
      </div>
    </div>
    <div class="card">
      <p>
        Available to claim
        <span class="wrapper--icon-help">
          <astar-icon-help size="16" />
        </span>
        <q-tooltip>
          <span class="text--tooltip">Available to claim</span>
        </q-tooltip>
      </p>
      <div class="row--data">
        <div class="value">5 Era</div>
        <astar-button width="80" height="24">Claim</astar-button>
      </div>
    </div>
    <div class="card">
      <p>
        Re-Stake after claiming
        <span class="wrapper--icon-help">
          <astar-icon-help size="16" />
        </span>
        <q-tooltip>
          <span class="text--tooltip">Re-Stake after claiming</span>
        </q-tooltip>
      </p>
      <div class="row--data">
        <div class="value">ON</div>
        <astar-button width="80" height="24">Turn Off</astar-button>
      </div>
    </div>
    <div class="card">
      <p>
        Total Earned (all-time)
        <span class="wrapper--icon-help">
          <astar-icon-help size="16" />
        </span>
        <q-tooltip>
          <span class="text--tooltip">Total Earned (all-time)</span>
        </q-tooltip>
      </p>
      <div class="row--data">
        <div class="value">10,000 ASTR</div>
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
import { defineComponent } from 'vue';
export default defineComponent({
  setup() {},
});
</script>
<style lang="scss" scoped>
@import './styles/my-rewards.scss';
</style>