<template>
  <div class="wrapper">
    <q-list>
      <q-item
        class="ic-item"
        clickable
        :active="selectLinkIdx === 0"
        active-class="active-item"
        @click="goToLink(0)"
      >
        <astar-icon-base class="icon" viewBox="0 0 448 512" icon-name="Discord">
          <astar-icon-discord />
        </astar-icon-base>

        <q-item-section class="item-name">{{ $t('sidenavi.discord') }}</q-item-section>
      </q-item>
      <q-item
        class="ic-item"
        clickable
        :active="selectLinkIdx === 1"
        active-class="active-item"
        @click="goToLink(1)"
      >
        <astar-icon-base class="icon" viewBox="0 0 448 512" icon-name="Twitter">
          <astar-icon-twitter />
        </astar-icon-base>

        <q-item-section class="item-name">{{ $t('sidenavi.twitter') }}</q-item-section>
      </q-item>
      <q-item
        class="ic-item"
        clickable
        :active="selectLinkIdx === 2"
        active-class="active-item"
        @click="goToLink(2)"
      >
        <astar-icon-base class="icon" viewBox="0 0 448 512" icon-name="Telegram">
          <astar-icon-telegram />
        </astar-icon-base>

        <q-item-section class="item-name">{{ $t('sidenavi.telegram') }}</q-item-section>
      </q-item>
      <q-item
        class="ic-item"
        clickable
        :active="selectLinkIdx === 3"
        active-class="active-item"
        @click="goToLink(3)"
      >
        <astar-icon-base class="icon" icon-name="Reddit">
          <astar-icon-reddit />
        </astar-icon-base>

        <q-item-section class="item-name">{{ $t('sidenavi.reddit') }}</q-item-section>
      </q-item>
      <q-item
        class="ic-item"
        clickable
        :active="selectLinkIdx === 4"
        active-class="active-item"
        @click="goToLink(4)"
      >
        <astar-icon-base class="icon" icon-name="Youtube">
          <astar-icon-youtube />
        </astar-icon-base>

        <q-item-section class="item-name">{{ $t('sidenavi.youtube') }}</q-item-section>
      </q-item>
      <!-- <q-item
        class="ic-item"
        clickable
        :active="selectLinkIdx === 5"
        active-class="active-item"
        @click="goToLink(5)"
      >
        <astar-icon-base class="icon" icon-name="Forum">
          <astar-icon-forum />
        </astar-icon-base>

        <q-item-section class="item-name">{{ $t('sidenavi.forum') }}</q-item-section>
      </q-item> -->
      <q-item
        class="ic-item"
        clickable
        :active="selectLinkIdx === 6"
        active-class="active-item"
        @click="goToLink(6)"
      >
        <astar-icon-base class="icon" viewBox="0 0 548 512" icon-name="Github">
          <astar-icon-github />
        </astar-icon-base>

        <q-item-section class="item-name">{{ $t('sidenavi.github') }}</q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, reactive } from 'vue';
import LightDarkMode from '../common/LightDarkMode.vue';
import { useStore } from 'src/store';
import { socialUrl, docsUrl } from 'src/links';
import { CultureCode, languagesSelector } from 'src/i18n';
import { i18n } from 'src/boot/i18n';

export default defineComponent({
  components: {
    // LightDarkMode,
  },
  emits: ['closeNavi'],
  setup(props, { emit }) {
    const store = useStore();
    const isDarkTheme = computed<boolean>(() => store.getters['general/theme'] === 'DARK');

    const classes = reactive({
      defaultHeader:
        'min-height: 40px; padding: 0; padding-left: 8px; padding-right: 8px; border-radius: 6px;',
      activeHeaderLight: 'background: #fff;',
      activeHeaderDark: 'background: rgba(255, 255, 255, 0.05);',
    });

    const selectLinkIdx = ref(-1);
    const goLink = (url: string) => {
      window.open(url, '_blank');
    };

    const goToLink = (linkIdx: number) => {
      selectLinkIdx.value = linkIdx;
      switch (linkIdx) {
        case 0:
          goLink(socialUrl.discord);
        case 1:
          goLink(socialUrl.twitter);
        case 2:
          goLink(socialUrl.telegram);
        case 3:
          goLink(socialUrl.reddit);
        case 4:
          goLink(socialUrl.youtube);
        case 5:
          goLink(socialUrl.forum);
        case 6:
          goLink(socialUrl.github);
      }
    };

    const goDocument = () => {
      goLink(docsUrl.topPage);
    };

    const selectLanguage = (code: CultureCode) => {
      i18n.global.locale.value = code;
    };

    const closeMobileNavi = () => {
      emit('closeNavi');
    };

    const expanded = ref(false);
    const expanded2 = ref(false);
    const expanded3 = ref(false);

    return {
      classes,
      expanded,
      expanded2,
      expanded3,
      isDarkTheme,
      selectLinkIdx,
      goToLink,
      goDocument,
      selectLanguage,
      closeMobileNavi,
    };
  },
  data() {
    return { langs: languagesSelector };
  },
});
</script>

<style lang="scss" scoped>
@import './styles/sidebar-community.scss';
</style>
