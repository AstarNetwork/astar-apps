<template>
  <div class="flex items-center tw-justify-center">
    <a :href="socialUrl.twitter" target="_blank" :class="classes.link" rel="noreferrer">
      <icon-base :class="classes.iconBase" viewBox="0 0 512 512" icon-name="Twitter">
        <icon-twitter />
      </icon-base>
    </a>

    <a :href="socialUrl.telegram" target="_blank" :class="classes.link" rel="noreferrer">
      <icon-base :class="classes.iconBase" viewBox="0 0 448 512" icon-name="Telegram">
        <icon-telegram />
      </icon-base>
    </a>

    <a :href="socialUrl.discord" target="_blank" :class="classes.link" rel="noreferrer">
      <icon-base :class="classes.iconBase" viewBox="0 0 448 512" icon-name="Discord">
        <icon-discord />
      </icon-base>
    </a>

    <a :href="socialUrl.github" target="_blank" :class="classes.link" rel="noreferrer">
      <icon-base :class="classes.iconBase" viewBox="0 0 496 512" icon-name="GitHub">
        <icon-github />
      </icon-base>
    </a>

    <a :href="docsUrl.topPage" target="_blank" :class="classes.link" rel="noreferrer">
      <icon-base :class="classes.iconBase" viewBox="0 0 24 24" icon-name="Documentation">
        <icon-document />
      </icon-base>
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
import { socialUrl, docsUrl } from 'src/links';

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
      link: 'icon-link',
      iconBase: 'tw-h-4 tw-w-4',
    });
    return {
      classes,
      socialUrl,
      docsUrl,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.icon-link {
  color: #5f656f;
  padding: 10px;
}

.body--dark {
  .icon-link {
    color: $gray-1;
  }
}
</style>
