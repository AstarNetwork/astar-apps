<template>
  <div>
    <div class="wrapper--vote">
      <back-to-page :text="$t('stakingV3.back')" :link="Path.DappStaking" />
      <voting-wizard
        :stake-to-address="selectedDappAddress"
        :move-from-address="dAppToMoveFromAddress"
        :step="0"
      />
    </div>
    <div
      class="bg--vote"
      :style="{
        backgroundImage: `url(${require('src/staking-v3/assets/dapp_staking_period002_bg.webp')})`,
      }"
    />
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useDappStaking } from '../hooks';
import { useNetworkInfo } from 'src/hooks';
import { useRoute } from 'vue-router';
import BackToPage from 'src/components/common/BackToPage.vue';
import { Path } from 'src/router';
import { docsUrl } from 'src/links';
import VotingWizard from './vote/VotingWizard.vue';

export default defineComponent({
  components: {
    BackToPage,
    VotingWizard,
  },
  setup() {
    const { constants } = useDappStaking();
    const { nativeTokenSymbol } = useNetworkInfo();
    const route = useRoute();

    const selectedDappAddress = ref<string>((route.query.dappAddress as string) ?? '');
    const dAppToMoveFromAddress = ref<string>((route.query.moveFromAddress as string) ?? '');

    return {
      constants,
      nativeTokenSymbol,
      Path,
      docsUrl,
      selectedDappAddress,
      dAppToMoveFromAddress,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './styles/vote.scss';
</style>
