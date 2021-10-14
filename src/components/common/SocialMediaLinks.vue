<template>
  <div class="flex items-center tw-justify-center">
    <!-- TODO: Links -->
    <a href="https://twitter.com/AstarNetwork" target="_blank" :class="classes.link">
      <!-- original icon -->
      <icon-base :class="classes.iconBase" viewBox="0 0 512 512" icon-name="Twitter">
        <icon-twitter />
      </icon-base>
      <!-- Tooltip -->
      <span :class="classes.tooltipText">
        {{ $t('common.twitter') }}
      </span>
    </a>

    <a href="https://t.me/PlasmOfficial" target="_blank" :class="classes.link">
      <!-- original icon -->
      <icon-base :class="classes.iconBase" viewBox="0 0 448 512" icon-name="Telegram">
        <icon-telegram />
      </icon-base>
      <!-- Tooltip -->
      <span :class="classes.tooltipText"> {{ $t('common.telegram') }} </span>
    </a>

    <a href="https://discord.gg/Z3nC9U4" target="_blank" :class="classes.link">
      <!-- original icon -->
      <icon-base :class="classes.iconBase" viewBox="0 0 448 512" icon-name="Discord">
        <icon-discord />
      </icon-base>
      <!-- Tooltip -->
      <span :class="classes.tooltipText"> {{ $t('common.discord') }} </span>
    </a>

    <a href="https://github.com/PlasmNetwork/Plasm" target="_blank" :class="classes.link">
      <!-- original icon -->
      <icon-base :class="classes.iconBase" viewBox="0 0 496 512" icon-name="GitHub">
        <icon-github />
      </icon-base>

      <!-- Tooltip -->
      <span :class="classes.tooltipText"> {{ $t('common.github') }} </span>
    </a>

    <a href="https://docs.astar.network/" target="_blank" :class="classes.link">
      <!-- Heroicon name: outline/document-text -->
      <icon-base
        :class="classes.iconBase"
        viewBox="0 0 24 24"
        stroke="currentColor"
        icon-color="none"
        icon-name="Documentation"
      >
        <icon-document />
      </icon-base>
      <!-- Tooltip -->
      <span :class="classes.tooltipText"> {{ $t('common.docs') }} </span>
    </a>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue';
import IconBase from '../icons/IconBase.vue';
import IconTwitter from '../icons/IconTwitter.vue';
import IconTelegram from '../icons/IconTelegram.vue';
import IconDocument from '../icons/IconDocument.vue';
import IconGithub from '../icons/IconGithub.vue';
import IconDiscord from '../icons/IconDiscord.vue';

export default defineComponent({
  components: {
    IconBase,
    IconTwitter,
    IconTelegram,
    IconDocument,
    IconGithub,
    IconDiscord,
  },
  setup() {
    const classes = reactive({
      link: 'tw-tooltip icon-link',
      iconBase: 'tw-text-blue-900 dark:tw-text-darkGray-300 tw-h-4 tw-w-4',
      tooltipText:
        'tw-pointer-events-none tw-hidden tw-absolute tw-top-0 tw-left-1/2 tw-z-10 tw-transform tw--translate-y-full tw--translate-x-1/2 tw-p-2 tw-text-xs tw-leading-tight tw-text-white tw-bg-gray-800 dark:tw-bg-darkGray-500 tw-rounded-md tw-shadow-lg tw-opacity-90 tw-whitespace-nowrap',
    });
    return {
      classes,
    };
  },
});
</script>

<style scoped>
.icon-link {
  @apply tw-p-3 tw-rounded-full tw-relative;
}
.icon-link:hover {
  @apply tw-bg-gray-100 dark:tw-bg-darkGray-600;
}
.icon-link:focus {
  @apply tw-z-10 tw-outline-none tw-ring tw-ring-gray-100 dark:tw-ring-darkGray-600 tw-bg-blue-50 dark:tw-bg-darkGray-900;
}
</style>
