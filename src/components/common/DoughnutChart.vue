<template>
  <div class="chart">
    <svg :style="containerStyle">
      <defs>
        <mask id="circleClip">
          <rect fill="white" width="100%" height="100%" />
          <circle fill="black" :cx="size * 0.55" :cy="size * 0.55" :r="size * 0.35" />
        </mask>
      </defs>
      <g mask="url(#circleClip)">
        <g
          v-for="(s, i) in processedSectors"
          :key="i"
          class="sector"
          @mouseover="(text = s.label), (value = s.value)"
          @mouseleave="(text = ''), (value = 0)"
        >
          <path :fill="s.color" :d="s.d" :transform="s.transform" />
        </g>
      </g>
      <circle fill="none" :cx="size * 0.55" :cy="size * 0.55" :r="size * 0.35" />
      <text
        :fill="textColor"
        :x="size * 0.55"
        :y="size * 0.55 - 28"
        font-size="24"
        font-weight="700"
        text-anchor="middle"
      >
        {{ text }}
      </text>
      <text
        v-if="value > 0"
        :fill="textColor"
        :x="size * 0.55"
        :y="size * 0.52"
        font-size="16"
        text-anchor="middle"
        dominant-baseline="hanging"
      >
        {{ formatNumber(value, 3) }} {{ tokenSymbol }}
      </text>
      <text
        v-if="value > 0"
        :fill="textColor"
        :x="size * 0.55"
        :y="size * 0.55 + 22"
        font-size="26"
        font-weight="700"
        text-anchor="middle"
        dominant-baseline="hanging"
      >
        {{ formatNumber((value / total()) * 100, 2) }} %
      </text>
    </svg>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch, computed } from 'vue';
import { formatNumber } from '@astar-network/astar-sdk-core';

interface ProcessedSector extends Sector {
  percentage: number;
  d: string;
  transform: string;
}

export interface Sector {
  value: number;
  label: string;
  color: string;
}

export default defineComponent({
  props: {
    size: {
      type: Number,
      default: 200,
    },
    sectors: {
      type: Object as PropType<Sector[]>,
      required: true,
      default: () => [] as object,
    },
    tokenSymbol: {
      type: String,
      required: true,
    },
    isDarkTheme: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const textColor = computed<string>(() => (props.isDarkTheme ? 'white' : '#080f2e'));
    const processedSectors = ref<ProcessedSector[]>([]);
    const text = ref<string>('');
    const value = ref<number>(0);

    const containerStyle = {
      width: `${props.size * 1.1}px`,
      height: `${props.size * 1.1}px`,
    };

    const total = (): number => props.sectors.reduce((t, s) => t + s.value, 0);

    const calculateSectors = () => {
      // This function calculates circle segments for each sector
      // The segments go all the way to the center, but the circle mask cuts the center out
      let l = props.size / 2;
      let rotation = 0;

      if (props.sectors.length === 1) {
        let item = props.sectors[0];
        processedSectors.value.push({
          value: item.value,
          percentage: 1,
          label: item.label,
          color: item.color,
          d: `M${l},0 A${l},${l} 0 0, 1 0, 0 z`,
          transform: `translate(${props.size * 0.05}, ${
            props.size * 0.05
          }) rotate(${rotation}, ${l}, ${l})`,
        });
      } else {
        props.sectors.forEach((item, key) => {
          let angle = (360 * item.value) / total();
          let aCalc = angle > 180 ? 360 - angle : angle;
          let angleRad = (aCalc * Math.PI) / 180;
          let sizeZ = Math.sqrt(2 * l * l - 2 * l * l * Math.cos(angleRad));

          let sideX;
          if (aCalc <= 90) {
            sideX = l * Math.sin(angleRad);
          } else {
            sideX = l * Math.sin(((180 - aCalc) * Math.PI) / 180);
          }

          let sideY = Math.sqrt(sizeZ * sizeZ - sideX * sideX);
          let y = sideY;

          let x;
          let arcSweep;
          if (angle <= 180) {
            x = l + sideX;
            arcSweep = 0;
          } else {
            x = l - sideX;
            arcSweep = 1;
          }

          processedSectors.value.push({
            value: item.value,
            percentage: Number(item.value / total()),
            label: item.label,
            color: item.color,
            d: `M${l},${l} L${l},0 A${l},${l} 0 ${arcSweep},1 ${x}, ${y} z`,
            transform: `translate(${props.size * 0.05}, ${
              props.size * 0.05
            }) rotate(${rotation}, ${l}, ${l})`,
          });

          rotation = rotation + angle;
        });
      }
    };

    watch(
      [props, textColor],
      () => {
        if (!props.sectors.find((x) => x.value === 0)) {
          processedSectors.value = [];
          calculateSectors();
        }
      },
      { deep: true, immediate: true }
    );

    return {
      processedSectors,
      text,
      value,
      containerStyle,
      formatNumber,
      total,
      textColor,
    };
  },
});
</script>

<style lang="scss" scoped>
$anim-dur: 400ms;
.chart {
  .sector {
    transform-origin: 50% 50%;
    transition: transform 400ms;

    &:hover {
      transform: scale(1.04);
    }
  }

  text {
    pointer-events: none;
  }

  circle {
    pointer-events: all;
  }
}
</style>
