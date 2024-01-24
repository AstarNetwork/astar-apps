<template>
  <div class="wrapper--remaining-days">
    <span @click="isBalloon = true" @mouseover="isBalloon = true" @mouseleave="isBalloon = false">
      {{ remainingEras }} / {{ remainingBlocks }}
    </span>
    <balloon
      class="balloon--unbondng"
      direction="right"
      :is-balloon="isBalloon"
      :is-balloon-closing="false"
      :handle-close-balloon="closeBalloon"
      :title="$t('stakingV3.whatIsRemainingDays')"
      :text="$t('stakingV3.yourTokensAreBeingUnbonded')"
    >
      <span class="balloon--unbondng__info">
        {{ $t('stakingV3.days', { day: remainingEras }) }}, {{ remainingBlocks }}
        {{ $t('stakingV3.blocks') }}
      </span>
    </balloon>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import Balloon from 'src/components/common/Balloon.vue';

export default defineComponent({
  components: {
    Balloon,
  },
  props: {
    remainingBlocks: {
      type: Number,
      required: true,
    },
    remainingEras: {
      type: Number,
      required: true,
    },
  },
  setup() {
    const isBalloon = ref<boolean>(false);

    const closeBalloon = () => {
      isBalloon.value = false;
    };

    return { isBalloon, closeBalloon };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.wrapper--remaining-days {
  position: relative;
  color: $astar-blue;
}
.balloon--unbondng {
  text-align: left;
  width: 250px;
  top: -81px;
  right: auto;
  left: -270px;
  @media (min-width: $sm) {
    width: 280px;
    top: -58px;
    right: auto;
    left: -300px;
  }
}

.balloon--unbondng__info {
  display: block;
  color: white;
  font-size: 16px;
  font-weight: 700;
  text-align: left;
}
</style>
