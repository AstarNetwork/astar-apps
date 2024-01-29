<template>
  <div class="wrapper--dapp-avatar">
    <div class="column--avatar">
      <div>
        <img class="image--dapp-icon" :src="dapp.dapp.iconUrl" :alt="dapp.dapp.name" />
      </div>
      <div class="column--details">
        <div class="row--dapp-title">
          <span class="text--xl text--color">{{ dapp.dapp.name }}</span>
        </div>
        <div v-if="dapp.dapp.tags" class="row--tags">
          <div v-for="tag in dapp.dapp.tags" :key="tag" class="tag">
            <span class="text--tag"> {{ tag }} </span>
          </div>
        </div>
        <div class="row--stake">
          <astar-button
            class="btn-size--stake"
            :disabled="isZkEvm || decommissionStarted"
            @click="goStakeLink(dapp.dapp.address)"
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
import { useAccount, useNetworkInfo, useDecommission } from 'src/hooks';
import { networkParam, Path } from 'src/router/routes';
import { defineComponent, computed } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  props: {
    dapp: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const router = useRouter();
    const { currentAccount } = useAccount();
    const { decommissionStarted } = useDecommission();
    const { isZkEvm } = useNetworkInfo();
    const twitterUrl = `https://twitter.com/intent/tweet?text=Nominate and Stake with us on @AstarNetwork!&hashtags=dAppStaking,Build2Earn&url=${window.location.href}`;

    const goEditLink = (): void => {
      const url = networkParam + Path.DappStaking + Path.Register;
      router.push(url);
    };

    const goStakeLink = (address: string): void => {
      const base = networkParam + Path.DappStaking + Path.Stake;
      const url = `${base}?dapp=${address.toLowerCase()}`;
      router.push(url);
    };

    const isDisabledEditButton = computed<boolean>(
      () => currentAccount.value !== props.dapp.contract.developerAddress
    );

    return {
      isDisabledEditButton,
      goEditLink,
      goStakeLink,
      twitterUrl,
      isZkEvm,
      decommissionStarted,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dapp-staking/dapp/styles/dapp-avatar.scss';

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
