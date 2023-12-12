<template>
  <div class="wrapper--dapp-avatar">
    <div class="column--avatar">
      <div>
        <img class="image--dapp-icon" :src="dapp.dapp.iconUrl" :alt="dapp.dapp.name" />
      </div>
      <div class="column--details">
        <div class="row--dapp-title">
          {{ dapp.dapp.name }}
        </div>
        <div class="row--dapp-description">
          {{ dapp.dapp.description }}
        </div>
        <div v-if="dapp.dapp.tags" class="row--tags">
          <div v-for="tag in dapp.dapp.tags" :key="tag" class="tag">
            {{ tag }}
          </div>
        </div>
      </div>
    </div>

    <div class="column--action">
      <astar-button v-if="!isDisabledEditButton" class="button--edit" @click="goEditLink">
        {{ $t('dappStaking.edit') }}
      </astar-button>

      <!-- TODO: add logic -->
      <a class="button--icon button--favorite">
        <astar-icon-heart />
        <q-tooltip>
          <span class="text--tooltip">{{ $t('assets.addToFavorite') }}</span>
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
    const { isZkEvm } = useNetworkInfo();
    const twitterUrl = `https://twitter.com/intent/tweet?text=Nominate and Stake with us on @AstarNetwork!&hashtags=dAppStaking,Build2Earn&url=${window.location.href}`;

    const goEditLink = (): void => {
      const url = networkParam + Path.DappStaking + Path.Register;
      router.push(url);
    };

    const isDisabledEditButton = computed<boolean>(
      () => currentAccount.value !== props.dapp.contract.developerAddress
    );

    return {
      isDisabledEditButton,
      goEditLink,
      twitterUrl,
      isZkEvm,
    };
  },
});
</script>

<style lang="scss" scoped>
@use './styles/dapp-avatar.scss';
</style>
