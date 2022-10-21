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
          <router-link :to="buildStakePageLink(dapp.dapp.address)">
            <astar-button class="btn-size--stake" :disabled="isDisabledStakeButton">
              <span class="text--btn-stake">
                {{ $t('dappStaking.stake') }}
              </span>
            </astar-button>
          </router-link>
        </div>
      </div>
    </div>
    <div class="column--edit">
      <!-- <astar-button class="btn-size--stake" :disabled="isDisabledEditButton"> -->
      <astar-button class="btn-size--stake">
        <span class="text--btn-stake">
          {{ $t('dappStaking.edit') }}
        </span>
      </astar-button>
    </div>
  </div>
</template>
<script lang="ts">
import { useAccount } from 'src/hooks';
import { networkParam, Path } from 'src/router/routes';
import { useStore } from 'src/store';
import { defineComponent, computed } from 'vue';
export default defineComponent({
  props: {
    dapp: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    const { currentAccount } = useAccount();
    const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
    const buildStakePageLink = (address: string): string => {
      const base = networkParam + Path.DappStaking + Path.Stake;
      return `${base}?dapp=${address.toLowerCase()}`;
    };

    const isDisabledStakeButton = computed<boolean>(() => isH160.value || !currentAccount.value);
    const isDisabledEditButton = computed<boolean>(
      () => currentAccount.value !== props.dapp.contract.developerAddress
    );

    return {
      buildStakePageLink,
      isDisabledStakeButton,
      isDisabledEditButton,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dapp-staking/dapp/styles/dapp-avatar.scss';
</style>
