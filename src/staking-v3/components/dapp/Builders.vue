<template>
  <div v-if="teams" class="wrapper--builders">
    <div class="row--builders-title">
      {{ $t('dappStaking.dappPage.team') }}
    </div>

    <div class="box--builders">
      <div v-for="(team, index) in teams" :key="index" class="card--builders">
        <div class="row--details">
          <img class="image--builder-icon" :src="team.iconFile" :alt="dapp.dapp.name" />
          <div>
            <div class="text--name">{{ team.name }}</div>
          </div>
        </div>
        <div class="row--icons">
          <button v-if="team.githubAccountUrl" class="box--share btn--primary">
            <div class="icon--social btn--effect">
              <a :href="team.githubAccountUrl" target="_blank" rel="noopener noreferrer">
                <astar-icon-base viewBox="0 0 512 512" icon-name="Github">
                  <astar-icon-github />
                </astar-icon-base>
              </a>
            </div>
            <q-tooltip>
              <span class="text--tooltip">{{ $t('common.github') }}</span>
            </q-tooltip>
          </button>
          <button v-if="team.twitterAccountUrl" class="box--share btn--primary">
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
          <button v-if="team.linkedInAccountUrl" class="box--share btn--primary">
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
  name: string;
  githubAccountUrl: string;
  linkedInAccountUrl: string;
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
      try {
        if (props.dapp.dapp && props.dapp.dapp.hasOwnProperty('developers')) {
          const developers = props.dapp.dapp.developers as Developer[];
          return developers.map((it) => {
            return {
              ...it,
              iconFile: it.iconFile.split('&#x2F;').join('/'),
            };
          });
        } else {
          return null;
        }
      } catch (error) {
        return null;
      }
    });
    return { teams };
  },
});
</script>

<style lang="scss" scoped>
@use './styles/builders.scss';
</style>