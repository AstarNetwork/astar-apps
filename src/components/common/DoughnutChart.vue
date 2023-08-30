<template>
  <div class="chart">
    <svg :style="containerStyle">
      <defs>
        <mask id="circleClip">
          <rect fill="white" width="100%" height="100%" />
          <circle fill="black" :cx="size * 0.55" :cy="size * 0.55" :r="size * 0.28" />
        </mask>
      </defs>
      <g mask="url(#circleClip)">
        <g
          v-for="(s, i) in processedSectors"
          :key="i"
          class="sector"
          @mouseover="(text = s.label), (value = s.value.toString())"
          @mouseleave="(text = ''), (value = '')"
        >
          <path :fill="s.color" :d="s.d" :transform="s.transform" />
        </g>
      </g>
      <circle fill="none" :cx="size * 0.55" :cy="size * 0.55" :r="size * 0.28" />
      <text fill="white" :x="size * 0.55" :y="size * 0.55 - 2" font-size="14" text-anchor="middle">
        {{ text }}
      </text>
      <text
        fill="white"
        :x="size * 0.55"
        :y="size * 0.55 + 2"
        font-size="16"
        text-anchor="middle"
        dominant-baseline="hanging"
      >
        {{ value }}
      </text>
    </svg>
  </div>
</template>

<!-- template#chart
  .chart
    svg(:style='styleObj')
      defs
        mask#circleClip
          rect(fill='white' width='100%' height='100%')
          circle(fill='black' :cx='size * 0.55' :cy='size * 0.55' :r='size * 0.28')
      g(mask='url(#circleClip)')
        g.sector(v-for='(s, i) in processedSectors' @mouseover='text=s.label, value=s.value' @mouseleave='text="", value=""')
          path(:fill='s.color' :d='s.d' :transform='s.transform')
      circle(fill='none' :cx='size * 0.55' :cy='size * 0.55' :r='size * 0.28')
      text(fill='white' :x='size * 0.55' :y='size * 0.55 - 2' font-size='20' text-anchor='middle') {{text}}
      text(fill='white' :x='size * 0.55' :y='size * 0.55 + 2' font-size='24' text-anchor='middle' dominant-baseline='hanging') {{value}} -->

<script lang="ts">
import { defineComponent, PropType, ref, watch } from 'vue';

interface ProcessedSector extends Sector {
  percentage: number;
  d: string;
  transform: string;
}

interface Sector {
  value: bigint;
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
  },
  setup(props) {
    const processedSectors = ref<ProcessedSector[]>([]);
    const text = ref<string>('');
    const value = ref<string>('');

    const containerStyle = {
      width: `${props.size * 1.1}px`,
      height: `${props.size * 1.1}px`,
    };

    const total = () => props.sectors.reduce((t, s) => t + s.value, BigInt(0));

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
          let angle = Number((BigInt(360) * item.value) / total());
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
      props.sectors,
      () => {
        processedSectors.value = [];
        calculateSectors();
      },
      { deep: true, immediate: true }
    );

    return {
      processedSectors,
      text,
      value,
      containerStyle,
    };
  },
});
</script>

/* jshint esversion: 6, asi: true, boss: true */ // Component Definitions
<!-- Vue.component('chart', {
  template: '#chart',
  props: [
    'size',
    'sectors'
  ],
  data () {
    return {
      styleObj: {
        width: `${this.size * 1.1}px`,
        height: `${this.size * 1.1}px`
      },
      processedSectors: [],
      text: '',
      value: ''
    }
  },
  computed: {
    total () {
      return this.sectors.reduce((t, s) => t + s.value, 0)
    }
  },
  watch: {
    sectors: {
      handler (val) {
        this.calculateSectors()
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    calculateSectors () {
      // This function calculates circle segments for each sector
      // The segments go all the way to the center, but the circle mask cuts the center out
      let l = this.size / 2
      let rotation = 0

      if (this.sectors.length === 1) {
        let item = this.sectors[0]
        this.processedSectors.push({
          value: item.value,
          percentage: 1,
          label: item.label,
          color: item.color,
          d: `M${l},0 A${l},${l} 0 ${arcSweep},1 ${x}, ${y} z`,
          transform: `translate(${this.size * 0.05}, ${this.size * 0.05}) rotate(${rotation}, ${l}, ${l})`
        })
      } else {
        this.sectors.forEach((item, key) => {
          let angle = 360 * item.value / this.total
          let aCalc = (angle > 180) ? 360 - angle : angle
          let angleRad = aCalc * Math.PI / 180
          let sizeZ = Math.sqrt(2 * l * l - (2 * l * l * Math.cos(angleRad)))

          let sideX
          if (aCalc <= 90) {
            sideX = l * Math.sin(angleRad)
          } else {
            sideX = l * Math.sin((180 - aCalc) * Math.PI / 180)
          }

          let sideY = Math.sqrt(sizeZ * sizeZ - sideX * sideX)
          let y = sideY

          let x
          let arcSweep
          if (angle <= 180) {
            x = l + sideX
            arcSweep = 0
          } else {
            x = l - sideX
            arcSweep = 1
          }

          this.processedSectors.push({
            value: item.value,
            percentage: item.value / this.total,
            label: item.label,
            color: item.color,
            d: `M${l},${l} L${l},0 A${l},${l} 0 ${arcSweep},1 ${x}, ${y} z`,
            transform: `translate(${this.size * 0.05}, ${this.size * 0.05}) rotate(${rotation}, ${l}, ${l})`
          })

          rotation = rotation + angle
        })
      }
    }
  }
})

// Point of entry
new Vue({
  el: '#app',
  data () {
    return {
      size: 200,
      sectors: [{
        value: 43,
        label: 'Thing 1',
        color: '#61C0BF'
      }, {
        value: 22,
        label: 'Thing Two',
        color: '#DA507A'
      }, {
        value: 18,
        label: 'Another Thing',
        color: '#BB3D49'
      }, {
        value: 32,
        label: 'Pineapple',
        color: '#DB4547'
      }]
    }
  }
}) -->

<style lang="scss" scoped>
$anim-dur: 200ms;
.chart {
  .sector {
    transform-origin: 50% 50%;
    transition: transform 200ms;

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
