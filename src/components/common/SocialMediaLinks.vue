<template>
  <div class="flex items-center tw-justify-evenly" :class="width < screenSize.sm ? 'm-header' : ''">
    <a :href="socialUrl.twitter" target="_blank" :class="classes.link" rel="noreferrer">
      <icon-base
        :class="classes.iconBase"
        class="twitter icon"
        viewBox="0 0 512 512"
        icon-name="Twitter"
      >
        <icon-twitter />
      </icon-base>
    </a>

    <a :href="socialUrl.telegram" target="_blank" :class="classes.link" rel="noreferrer">
      <icon-base
        :class="classes.iconBase"
        class="telegram icon"
        viewBox="0 0 448 512"
        icon-name="Telegram"
      >
        <icon-telegram />
      </icon-base>
    </a>

    <a :href="socialUrl.discord" target="_blank" :class="classes.link" rel="noreferrer">
      <icon-base
        class="discord icon"
        :class="classes.iconBase"
        viewBox="0 0 448 512"
        icon-name="Discord"
      >
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
import { useBreakpoints } from 'src/hooks';
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
    const { width, screenSize } = useBreakpoints();
    const classes = reactive({
      link: 'icon-link',
      iconBase: 'tw-h-4 tw-w-4',
    });
    return {
      classes,
      socialUrl,
      docsUrl,
      width,
      screenSize,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.icon {
  -webkit-transition: all 0.2s ease;
  -moz-transition: all 0.2s ease;
  -o-transition: all 0.2s ease;
  transition: all 0.2s ease;
  &:hover {
    -webkit-transition: all 0.2s ease;
    -moz-transition: all 0.2s ease;
    -o-transition: all 0.2s ease;
    transition: all 0.2s ease;
  }
}

.icon-link {
  color: $gray-4;
  padding: 10px;
  height: 36px;
  width: 36px;
  -webkit-transition: all 0.2s ease;
  -moz-transition: all 0.2s ease;
  -o-transition: all 0.2s ease;
  transition: all 0.2s ease;
  &:hover {
    -webkit-transition: all 0.2s ease;
    -moz-transition: all 0.2s ease;
    -o-transition: all 0.2s ease;
    transition: all 0.2s ease;
  }
}

.icon-link:hover {
  background: $gray-1;
  border-radius: 100%;
  .twitter {
    color: #1da1f2;
  }

  .telegram {
    color: #229ed9;
  }

  .discord {
    color: #7289da;
  }
}

.m-header {
  .icon-link {
    color: $gray-4;
  }
  .icon-link:hover {
    background: white;
    border-radius: 100%;
  }
}

.body--dark {
  .icon-link {
    color: $gray-1;
  }
  .icon-link:hover {
    background: $gray-5-selected-dark;
  }
  .m-header {
    .icon-link:hover {
      background: $gray-6;
    }
  }
}
</style>
