<template>
  <div class="wrapper--builders">
    <div class="row--builders-title">
      <span class="text--xl text--color"> {{ $t('dappStaking.dappPage.builders') }}</span>
    </div>
    <div class="box--builders">
      <div class="card--builders">
        <div class="row--details">
          <img class="image--builder-icon" :src="dapp.dapp.iconUrl" :alt="dapp.dapp.name" />
          <div>
            <div class="text--name">Name</div>
            <div class="text--position">Lead dev</div>
          </div>
        </div>
        <div class="row--icons">
          <button class="box--share btn--primary">
            <div class="icon--social">
              <a href="" target="_blank" rel="noopener noreferrer">
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
              <a href="" target="_blank" rel="noopener noreferrer">
                <astar-icon-base viewBox="0 0 512 512" icon-name="Telegram">
                  <astar-icon-github />
                </astar-icon-base>
              </a>
            </div>
            <q-tooltip>
              <span class="text--tooltip">{{ $t('common.github') }}</span>
            </q-tooltip>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  props: {
    dapp: {
      type: Object,
      required: true,
    },
  },
  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dapp-staking/dapp/styles/builders.scss';
</style>
