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
            :disabled="isH160"
            class="btn-size--stake"
            @click="goStakeLink(dapp.dapp.address)"
          >
            <span class="text--btn-stake">
              {{ $t('dappStaking.stake') }}
            </span>
          </astar-button>
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
import { useAccount } from 'src/hooks';
import { networkParam, Path } from 'src/router/routes';
import { defineComponent, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'src/store';

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
    const store = useStore();
    const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);

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
      isH160,
      goStakeLink,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dapp-staking/dapp/styles/dapp-avatar.scss';
</style>
