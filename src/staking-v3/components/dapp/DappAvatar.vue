<template>
  <div class="wrapper--dapp-avatar">
    <div class="column--avatar">
      <div>
        <img class="image--dapp-icon" :src="dapp.extended?.iconUrl" :alt="dapp.extended?.name" />
      </div>
      <div class="column--details">
        <div class="row--dapp-title">
          <span class="text--xl text--color">{{ dapp.extended?.name }}</span>
        </div>
        <div v-if="dapp.extended?.tags" class="row--tags">
          <div v-for="tag in dapp.extended?.tags" :key="tag" class="tag">
            <span class="text--tag"> {{ tag }} </span>
          </div>
        </div>
        <div class="row--stake">
          <astar-button
            class="btn-size--stake"
            :disabled="isZkEvm"
            @click="navigateToVote(dapp.chain.address)"
          >
            <span class="text--btn-stake">
              {{ $t('dappStaking.stake') }}
            </span>
          </astar-button>
          <a :href="twitterUrl" target="_blank" class="twitter-link">
            <astar-icon-base class="twitter-icon" viewBox="0 0 512 512" icon-name="Twitter">
              <astar-icon-twitter />
            </astar-icon-base>
            {{ $t('share') }}
          </a>
        </div>
      </div>
    </div>
    <div class="column--edit">
      <astar-button v-if="!isDisabledEditButton" class="btn-size--stake" @click="goEditLink">
        <span class="text--btn-stake">
          {{ $t('dappStaking.edit') }}
        </span>
      </astar-button>
    </div>
  </div>
</template>
<script lang="ts">
import { useAccount, useNetworkInfo } from 'src/hooks';
import { networkParam, Path } from 'src/router/routes';
import { useDappStakingNavigation } from 'src/staking-v3/hooks';
import { CombinedDappInfo } from 'src/staking-v3/logic';
import { defineComponent, computed, PropType } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  props: {
    dapp: {
      type: Object as PropType<CombinedDappInfo>,
      required: true,
    },
  },
  setup(props) {
    const router = useRouter();
    const { currentAccount } = useAccount();
    const { isZkEvm } = useNetworkInfo();
    const { navigateToVote } = useDappStakingNavigation();
    const twitterUrl = `https://twitter.com/intent/tweet?text=Nominate and Stake with us on @AstarNetwork!&hashtags=dAppStaking,Build2Earn&url=${window.location.href}`;

    const goEditLink = (): void => {
      const url = networkParam + Path.DappStaking + Path.Register;
      router.push(url);
    };

    // Disable dApp editing for now
    const isDisabledEditButton = computed<boolean>(
      () => true // currentAccount.value !== props.dapp.chain.owner
    );

    return {
      isDisabledEditButton,
      goEditLink,
      navigateToVote,
      twitterUrl,
      isZkEvm,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/staking-v3/components/dapp/styles/dapp-avatar.scss';

.twitter-icon {
  width: 20px;
  margin-left: 24px;
  margin-right: 8px;
  color: #1da1f2;
}

.twitter-link {
  display: flex;
  align-items: center;
  color: #1da1f2;
  font-size: 14px;
  font-weight: 600;
}
</style>
