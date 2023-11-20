<template>
  <div class="wrapper--promo">
    <div class="row--title">
      <span class="text--promo-title"> New dapp promotion </span>
    </div>
    <div>
      <span>{{ promotedDapp?.shortDescription }}</span>
    </div>
    <div class="row--button">
      <astar-button class="button--link" @click="navigateToVote(promotedDapp?.address)">
        Stake on {{ promotedDapp?.name }}
      </astar-button>
    </div>
    <div class="row--data">
      <div class="card--data">
        <div class="card__top">
          <span class="text--card-title">BUILD</span>
        </div>
        <div class="card__bottom">
          <span class="text--value">{{ registeredDapps.length }}</span>
          <span class="text--value-small">/{{ constants?.maxNumberOfContracts ?? '-' }}</span>
        </div>
      </div>
      <div class="promo__data">
        <div class="card--data">
          <div class="card__top">
            <span class="text--card-title">Basic Rewards</span>
          </div>
          <div class="card__bottom">
            <span class="text--value">9.7%</span>
          </div>
        </div>
      </div>
      <div class="promo__data">
        <div class="card--data">
          <div class="card__top">
            <span class="text--card-title">Bonus Rewards</span>
          </div>
          <div class="card__bottom">
            <span class="text--value">2.3%</span>
          </div>
        </div>
      </div>
      <div class="promo__data">
        <div class="card--data">
          <div class="card__top">
            <span class="text--card-title">TVL</span>
          </div>
          <div class="card__bottom">
            <span class="text--value"
              ><format-balance :balance="currentEraInfo?.totalLocked?.toString() ?? ''"
            /></span>
          </div>
        </div>
      </div>
    </div>
    <div class="row--start-staking">
      <button class="button--staking">
        <span class="text--start-staking" @click="navigateToVote()">Start Staking Now</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useDappStaking, useDapps, useCampaign } from '../hooks';
import { Campaign } from 'src/v2/models';
import { Path, networkParam } from 'src/router/routes';
import FormatBalance from 'src/components/common/FormatBalance.vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  components: {
    FormatBalance,
  },
  setup() {
    const { constants, currentEraInfo } = useDappStaking();
    const { registeredDapps } = useDapps();
    const { newListings } = useCampaign();
    const router = useRouter();
    // const { totalSupply } = useTokenCirculation();

    // const tvlPercentage = computed<number>(
    //   () =>
    //     Number(ethers.utils.formatEther(currentEraInfo.value?.totalLocked.toString() ?? 0)) /
    //     totalSupply.value
    // );

    const promotedDapp = computed<Campaign | undefined>(() =>
      newListings.value.length ? newListings.value[0] : undefined
    );

    const navigateToVote = (dAppAddress: string | undefined = undefined): void => {
      const base = networkParam + Path.DappStakingV3 + Path.Vote;
      router.push(`${base}?dappAddress=${dAppAddress ?? ''}`);
    };

    return { constants, registeredDapps, promotedDapp, currentEraInfo, navigateToVote };
  },
});
</script>
<style lang="scss" scoped>
@use './styles/feature-dapp.scss';
</style>
