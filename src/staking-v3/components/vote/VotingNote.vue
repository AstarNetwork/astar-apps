<template>
  <div class="wrapper--voting-note">
    <div class="note-container note">
      <div class="note--title">{{ $t('stakingV3.voting.note') }}</div>
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

    <div class="note-container">
      <div class="note--title">{{ $t('stakingV3.voting.learn') }}</div>
      <ul>
        <li>
          <a :href="docsUrl.learnDappStaking" target="_blank" rel="noopener noreferrer">
            {{ $t('stakingV3.voting.whatIsDappStaking') }}
          </a>
        </li>
        <li>
          <a :href="docsUrl.dappStakingForStakers" target="_blank" rel="noopener noreferrer">
            {{ $t('stakingV3.voting.howToParticipate') }}
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { useDappStaking } from 'src/staking-v3/hooks';
import { useNetworkInfo } from 'src/hooks';
import { docsUrl } from 'src/links';

export default defineComponent({
  setup() {
    const { constants } = useDappStaking();
    const { nativeTokenSymbol } = useNetworkInfo();

    return {
      constants,
      nativeTokenSymbol,
      docsUrl,
    };
  },
});
</script>

<style lang="scss" scoped>
.wrapper--voting-note {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 8px;

  @media (min-width: $lg) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  ul {
    padding-left: 20px;
  }

  li {
    list-style-type: disc;
  }

  a {
    color: $astar-blue;
    transition: all 0.2s ease;

    &:hover {
      color: $astar-blue-dark;
    }
  }
}

.note-container {
  padding: 16px;
  border-radius: 16px;
  border: 1px solid $navy-1;
}

.note--title {
  font-weight: 700;
  margin-bottom: 8px;
}
</style>
