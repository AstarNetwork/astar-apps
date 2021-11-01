<template>
  <div
    :class="`tw-border ${bgColor(
      alertType
    )} tw-shadow tw-rounded-lg tw-fixed tw-top-3 tw-right-3 tw-left-3 sm:tw-left-auto sm:tw-max-w-sm sm:tw-w-full tw-p-3 tw-flex tw-z-50`"
  >
    <div>
      <svg
        :class="`tw-h-6 tw-w-6 ${svgColor(alertType)}`"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          v-if="alertType === 'success'"
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clip-rule="evenodd"
        />
        <path
          v-if="alertType === 'warning'"
          d="M18.344,16.174l-7.98-12.856c-0.172-0.288-0.586-0.288-0.758,0L1.627,16.217c0.339-0.543-0.603,0.668,0.384,0.682h15.991C18.893,16.891,18.167,15.961,18.344,16.174 M2.789,16.008l7.196-11.6l7.224,11.6H2.789z M10.455,7.552v3.561c0,0.244-0.199,0.445-0.443,0.445s-0.443-0.201-0.443-0.445V7.552c0-0.245,0.199-0.445,0.443-0.445S10.455,7.307,10.455,7.552M10.012,12.439c-0.733,0-1.33,0.6-1.33,1.336s0.597,1.336,1.33,1.336c0.734,0,1.33-0.6,1.33-1.336S10.746,12.439,10.012,12.439M10.012,14.221c-0.244,0-0.443-0.199-0.443-0.445c0-0.244,0.199-0.445,0.443-0.445s0.443,0.201,0.443,0.445C10.455,14.021,10.256,14.221,10.012,14.221"
        ></path>
        <path
          v-if="alertType === 'error'"
          d="M10.185,1.417c-4.741,0-8.583,3.842-8.583,8.583c0,4.74,3.842,8.582,8.583,8.582S18.768,14.74,18.768,10C18.768,5.259,14.926,1.417,10.185,1.417 M10.185,17.68c-4.235,0-7.679-3.445-7.679-7.68c0-4.235,3.444-7.679,7.679-7.679S17.864,5.765,17.864,10C17.864,14.234,14.42,17.68,10.185,17.68 M10.824,10l2.842-2.844c0.178-0.176,0.178-0.46,0-0.637c-0.177-0.178-0.461-0.178-0.637,0l-2.844,2.841L7.341,6.52c-0.176-0.178-0.46-0.178-0.637,0c-0.178,0.176-0.178,0.461,0,0.637L9.546,10l-2.841,2.844c-0.178,0.176-0.178,0.461,0,0.637c0.178,0.178,0.459,0.178,0.637,0l2.844-2.841l2.844,2.841c0.178,0.178,0.459,0.178,0.637,0c0.178-0.176,0.178-0.461,0-0.637L10.824,10z"
        ></path>
      </svg>
    </div>
    <div class="tw-ml-3 tw-flex-1 tw-pt-0.5">
      <p :class="`tw-text-sm tw-break-all tw-font-medium ${txtColor(alertType)}`">
        {{ $t(msg) }}
      </p>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  props: {
    msg: {
      type: String,
      required: true,
    },
    alertType: {
      type: String,
      default: 'success',
      required: true,
    },
  },
  setup(props) {
    props.alertType;
  },
  methods: {
    bgColor(alertType: string) {
      if (alertType === 'warning') {
        return 'tw-bg-yellow-50 dark:tw-bg-yellow-100 tw-border-yellow-400';
      } else if (alertType === 'error') {
        return 'tw-bg-red-50 dark:tw-bg-red-100 tw-border-red-400';
      } else {
        return 'tw-bg-green-50 dark:tw-bg-green-100 tw-border-green-400';
      }
    },
    svgColor(alertType: string) {
      if (alertType === 'warning') {
        return 'tw-text-yellow-400';
      } else if (alertType === 'error') {
        return 'tw-text-red-400';
      } else {
        return 'tw-text-green-400';
      }
    },
    txtColor(alertType: string) {
      if (alertType === 'warning') {
        return 'tw-text-yellow-600';
      } else if (alertType === 'error') {
        return 'tw-text-red-600';
      } else {
        return 'tw-text-green-600';
      }
    },
  },
});
</script>
