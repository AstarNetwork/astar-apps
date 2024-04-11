<template>
  <div :class="`wrapper--dapp-avatar ${small ? 'small' : ''}`">
    <div class="column--avatar">
      <div class="image--dapp-icon">
        <img :src="dapp.extended?.iconUrl" :alt="dapp.extended?.name" />
      </div>
      <div class="column--details">
        <div class="row--dapp-title">
          {{ dapp.extended?.name }}
        </div>
        <div v-if="!small" class="row--dapp-description">
          {{ dapp.extended?.shortDescription }}
        </div>
        <div v-if="dapp.extended?.tags && !small" class="row--tags">
          <div v-for="tag in dapp.extended?.tags" :key="tag" class="tag">
            <span class="text--tag"> {{ tag }} </span>
          </div>
        </div>
      </div>
    </div>

    <div class="column--action">
      <astar-button v-if="!isDisabledEditButton" class="button--edit" @click="goEditLink">
        {{ $t('dappStaking.edit') }}
      </astar-button>

      <a class="button--icon button--favorite">
        <astar-icon-heart />
        <q-tooltip>
          <span class="text--tooltip">{{ $t('common.comingSoon') }}</span>
        </q-tooltip>
      </a>

      <a :href="twitterUrl" target="_blank" class="button--icon button--share">
        <astar-icon-share />
        <q-tooltip>
          <span class="text--tooltip">{{ $t('share') }}</span>
        </q-tooltip>
      </a>
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
    small: {
      type: Boolean,
      required: false,
      default: false,
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
@use './styles/dapp-avatar.scss';
</style>
