<template>
  <div class="message">
    <div class="tw-tooltip tw-relative">
      <div class="tw-flex">
        <q-icon v-if="!message.isConstructor" :name="icPlayArrow" class="tw-mr-2" @click="onCall" />
        <div
          class="tw-font-semibold"
          :class="[message.isConstructor ? 'tw-text-blue-400' : 'tw-text-yellow-400']"
        >
          {{ message.identifier }}
        </div>
        <div>{{ `(${argsString})${returnTypeString}` }}</div>
      </div>
      <!-- Tooltip -->
      <span
        class="
          tw-tooltip-shadow
          dark:tw-bg-darkGray-900
          tw-hidden tw-absolute tw-z-10 tw-top-6 tw-left-5 tw-text-s
          dark:tw-text-white
          tw-bg-gray-800 tw-rounded-md
        "
      >
        <div>
          <div
            class="tw-flex tw-bg-gray-100 dark:tw-bg-darkGray-800 tw-px-2 tw-py-1 tw-rounded-t-md"
          >
            <div
              class="tw-font-semibold"
              :class="[message.isConstructor ? 'tw-text-blue-400' : 'tw-text-yellow-400']"
            >
              {{ message.identifier }}
            </div>
            <div>{{ `(${argsString})${returnTypeString}` }}</div>
          </div>
          <div
            class="
              tw-leading-7 tw-px-2 tw-py-2 tw-float-left tw-w-96 tw-bg-gray-200
              dark:tw-bg-darkGray-900
            "
          >
            {{ docsString }}
          </div>
        </div>
      </span>
    </div>
  </div>
</template>
<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { MessageType } from 'src/hooks/types/Message';
import { matPlayArrow } from '@quasar/extras/material-icons';
export default defineComponent({
  props: {
    message: {
      required: true,
      type: Object as PropType<MessageType>,
    },
    messageIndex: {
      type: Number,
      default: 0,
    },
  },
  emits: ['call-method'],
  setup(props, { emit }) {
    let icPlayArrow = matPlayArrow;
    let argsString = props.message.args.map(({ name, type }) => `${name}: ${type.type}`).join(', ');
    if (!argsString.length) {
      argsString = ' ';
    }

    const docsString = props.message.docs.join('\n') || 'No documentation provided';
    const returnTypeString = props.message.returnType ? `: ${props.message.returnType.type}` : '';

    const onCall = () => {
      emit('call-method', props.messageIndex);
    };

    return { argsString, docsString, returnTypeString, icPlayArrow, onCall };
  },
});
</script>

<style>
.tooltip-shadow {
  box-shadow: 2px 3px 3px 1px rgba(21, 19, 19, 0.427);
}
.message {
  @apply tw-cursor-default tw-my-2 tw-py-1 tw-px-2 dark:tw-text-white tw-bg-gray-100 dark:tw-bg-darkGray-800 tw-rounded-sm;
}
.message:hover {
  @apply tw-bg-gray-200 dark:tw-bg-darkGray-700;
}
</style>
