<template>
  <div v-if="teams" class="wrapper--builders">
    <div class="row--builders-title">
      <span class="text--xl text--color"> {{ $t('dappStaking.dappPage.teams') }}</span>
    </div>
    <div class="box--builders">
      <div v-for="(team, index) in teams" :key="index" class="card--builders">
        <div class="row--details">
          <img class="image--builder-icon" :src="dapp.dapp.iconUrl" :alt="dapp.dapp.name" />
          <!-- <img class="image--builder-icon" :src="dapp.dapp.iconUrl" :alt="dapp.dapp.name" /> -->
          <div>
            <div class="text--name">{{ team.name }}</div>
            <!-- <div class="text--position">Lead dev</div> -->
          </div>
        </div>
        <div class="row--icons">
          <button class="box--share btn--primary">
            <div class="icon--social btn--effect">
              <a :href="team.twitterAccountUrl" target="_blank" rel="noopener noreferrer">
                <astar-icon-base viewBox="0 0 512 512" icon-name="Twitter">
                  <astar-icon-twitter />
                </astar-icon-base>
              </a>
            </div>
            <q-tooltip>
              <span class="text--tooltip">{{ $t('common.twitter') }}</span>
            </q-tooltip>
          </button>
          <button class="box--share btn--primary">
            <div class="icon--social">
              <a :href="team.linkedInAccountUrl" target="_blank" rel="noopener noreferrer">
                <astar-icon-base viewBox="0 0 72 72" icon-name="LinkedIn">
                  <astar-icon-linkedin />
                </astar-icon-base>
              </a>
            </div>
            <q-tooltip>
              <span class="text--tooltip">{{ $t('common.linkedIn') }}</span>
            </q-tooltip>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed } from 'vue';

interface Developer {
  iconFile: string;
  linkedInAccountUrl: string;
  name: string;
  twitterAccountUrl: string;
}

export default defineComponent({
  props: {
    dapp: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const teams = computed<Developer[] | null>(() => {
      if (props.dapp.dapp && props.dapp.dapp.hasOwnProperty('developers')) {
        return props.dapp.dapp.developers as Developer[];
      } else {
        return null;
      }
    });
    return { teams };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dapp-staking/dapp/styles/builders.scss';
</style>
