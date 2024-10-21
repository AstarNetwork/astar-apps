<template>
  <div v-if="isEnabled" class="governance-links-container governance-container">
    <div class="header"><img :src="icon" />{{ $t('governance.newProposals') }}</div>
    <hr class="separator" />
    <div class="governance-container">
      <div v-for="proposal in proposals" :key="proposal.index">
        <governance-link :index="proposal.index" :title="proposal.title" :url="proposal.url" />
      </div>
    </div>
    <div v-if="ongoingReferenda" class="governance-container">
      <div class="header"><img :src="icon" />{{ $t('governance.ongoingReferenda') }}</div>
      <hr class="separator" />
      <governance-link
        :index="ongoingReferenda.index"
        :title="ongoingReferenda.title"
        :url="ongoingReferenda.url"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useGovernance } from 'src/hooks';
import icon from 'src/components/governance/Governance.svg';
import GovernanceLink from './GovernanceLink.vue';

export default defineComponent({
  components: { GovernanceLink },
  setup() {
    const { isEnabled, proposals, ongoingReferenda } = useGovernance();

    return { isEnabled, icon, proposals, ongoingReferenda };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.governance-links-container {
  background-color: $white;
  border: 1px solid $gray-2;
  border-radius: 16px;
  padding: 16px 24px;
  font-size: 15px;
  font-weight: 500;
  line-height: 18px;
  color: $navy-1;
}

.governance-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.separator {
  border-top: 1px solid $gray-2;
}

.header {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
