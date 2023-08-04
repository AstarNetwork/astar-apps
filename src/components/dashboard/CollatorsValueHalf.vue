<template>
  <div v-if="accounts" class="container--value">
    <div class="row">
      <span class="text--accent container--title--color">{{ title }}</span>
    </div>
    <div class="row--value">
      <div class="align-right text--xlg">
        <span class="text--value text-color--neon"> {{ accounts.length }} </span>
      </div>
      <div v-click-away="setIsMobileDisplayTooltip" @click="setIsMobileDisplayTooltip">
        <astar-icon-info size="19" />
        <q-tooltip
          v-model="isDisplayTooltip"
          anchor="top middle"
          self="bottom middle"
          class="box--tooltip width-auto"
        >
          <div v-for="(account, index) in accounts" :key="index">
            <p>{{ account }}</p>
          </div>
        </q-tooltip>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useTooltip } from 'src/hooks';
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    title: {
      type: String,
      required: true
    },
    accounts: {
      type: Array<String>,
      required: false,
      default: []
    }
  },
  setup() {
    const { isDisplayTooltip, setIsMobileDisplayTooltip } = useTooltip('icon');
    return { isDisplayTooltip, setIsMobileDisplayTooltip }
  }
});
</script>

<style lang="scss" scoped>
@use 'src/components/dashboard/styles/collators.scss';
</style>
