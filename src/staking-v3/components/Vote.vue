<template>
  <div>
    <div class="wrapper--vote">
      <back-to-page :text="$t('stakingV3.back')" :link="Path.DappStaking" />
      <voting-wizard
        :stake-to-address="selectedDappAddress"
        :move-from-address="dAppToMoveFromAddress"
      />
      <div class="column--help">
        <div class="note">
          <b>{{ $t('stakingV3.voting.note') }}</b>
          <ul>
            <li>
              {{
                $t('stakingV3.voting.minimumStakingAmount', {
                  amount: constants?.minStakeAmountToken,
                  symbol: nativeTokenSymbol,
                })
              }}
            </li>
            <li>
              {{
                $t('stakingV3.voting.minBalanceAfterStaking', {
                  amount: constants?.minBalanceAfterStaking,
                  symbol: nativeTokenSymbol,
                })
              }}
            </li>
          </ul>
        </div>

        <div class="note">
          <b>{{ $t('stakingV3.voting.learn') }}</b>
          <ul>
            <li>
              <a
                :href="docsUrl.learnDappStaking"
                target="_blank"
                rel="noopener noreferrer"
                class="link--learn"
              >
                {{ $t('stakingV3.voting.whatIsDappStaking') }}
              </a>
            </li>
            <li>
              <a
                :href="docsUrl.dappStakingForStakers"
                target="_blank"
                rel="noopener noreferrer"
                class="link--learn"
              >
                {{ $t('stakingV3.voting.howToParticipate') }}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div
      class="bg--vote"
      :style="{ backgroundImage: `url(${require('/src/staking-v3/assets/vote_bg.webp')})` }"
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
