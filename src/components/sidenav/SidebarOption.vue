<template>
  <div class="wrapper">
    <q-list>
      <q-expansion-item
        v-model="expanded"
        :header-style="`${classes.defaultHeader} ${
          isDarkTheme ? classes.activeHeaderDark : classes.activeHeaderLight
        }`"
      >
        <template #header>
          <astar-icon-base class="header-icon tw-ml-1 tw-mt-2">
            <astar-icon-community />
          </astar-icon-base>
          <q-item-section class="exansion-title"> Community </q-item-section>
        </template>

        <q-list class="expansion-list">
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

            <q-item-section class="item-name">Discord</q-item-section>
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

            <q-item-section class="item-name">Twitter</q-item-section>
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

            <q-item-section class="item-name">Telegram</q-item-section>
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

            <q-item-section class="item-name">Reddit</q-item-section>
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

            <q-item-section class="item-name">Youtube</q-item-section>
          </q-item>
          <q-item
            class="ic-item"
            clickable
            :active="selectLinkIdx === 5"
            active-class="active-item"
            @click="goToLink(5)"
          >
            <astar-icon-base class="icon" icon-name="Forum">
              <astar-icon-forum />
            </astar-icon-base>

            <q-item-section class="item-name">Forum</q-item-section>
          </q-item>
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

            <q-item-section class="item-name">Github</q-item-section>
          </q-item>
        </q-list>
      </q-expansion-item>
      <q-expansion-item
        expand-icon="none"
        :header-style="`${classes.defaultHeader} ${
          isDarkTheme ? classes.activeHeaderDark : classes.activeHeaderLight
        }`"
        @click="goDocument()"
      >
        <template #header>
          <astar-icon-base class="header-icon tw-ml-1 tw-mt-2">
            <astar-icon-docs />
          </astar-icon-base>
          <q-item-section class="exansion-title"> Docs </q-item-section>
        </template>
      </q-expansion-item>
      <q-expansion-item
        v-model="expanded2"
        :header-style="`${classes.defaultHeader} ${
          isDarkTheme ? classes.activeHeaderDark : classes.activeHeaderLight
        }`"
      >
        <template #header>
          <astar-icon-base class="header-icon">
            <astar-icon-3dots />
          </astar-icon-base>
          <q-item-section class="exansion-title"> Settings </q-item-section>
        </template>
        <div class="wrapper--option">
          <q-expansion-item
            v-model="expanded3"
            :header-style="`${classes.defaultHeader} ${
              isDarkTheme ? classes.activeHeaderDark : classes.activeHeaderLight
            }`"
          >
            <template #header>
              <q-item-section class="exansion-title item-name"> Language </q-item-section>
            </template>
            <div>
              <q-item
                v-for="(lang, i) in langs"
                :key="`Lang${i}`"
                class="ic-item"
                clickable
                @click="selectLanguage(lang.code)"
              >
                <q-item-section class="item-name">{{ lang.text }}</q-item-section>
              </q-item>
            </div>
          </q-expansion-item>
          <q-item class="ic-item item--sub" clickable active-class="active-item">
            <q-item-section class="item-name">Theme</q-item-section>
            <LightDarkMode />
          </q-item>
        </div>
      </q-expansion-item>
      <div class="button--close" @click="closeMobileNavi">X Close</div>
    </q-list>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import LightDarkMode from '../common/LightDarkMode.vue';
import { useStore } from 'src/store';
import { socialUrl, docsUrl } from 'src/links';
import { languagesSelector } from 'src/i18n';
import { i18n } from 'src/boot/i18n';

export default defineComponent({
  components: {
    LightDarkMode,
  },
  emits: ['closeNavi'],
  setup(props, { emit }) {
    const store = useStore();
    const isDarkTheme = computed<boolean>(() => store.getters['general/theme'] === 'DARK');

    const classes = reactive({
      defaultHeader:
        'min-height: 40px; padding: 0; padding-left: 8px; padding-right: 8px; border-radius: 6px;',
      defaultSubHeader:
        'min-height: 40px; width: 100%; padding: 0; padding-left: 8px; border-radius: 6px;',
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

    const selectLanguage = (code: string) => {
      console.log('c', code);
      i18n.global.locale = code;
    };

    const closeMobileNavi = () => {
      emit('closeNavi');
    };

    const expanded = ref(false);
    const expanded2 = ref(false);
    const expanded3 = ref(false);
    const showOption = ref(false);
    const router = useRouter();
    const path = computed(() => router.currentRoute.value.path.split('/')[1]);
    const active = ref(true);

    return {
      classes,
      expanded,
      expanded2,
      expanded3,
      showOption,
      path,
      active,
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
@import './styles/sidebar-mobile.scss';

.wrapper {
  background: $gray-1;
  box-shadow: 0px 0px 24px 4px rgba(0, 0, 0, 0.08);
  padding-top: 16px;
}

.q-expansion-item {
  padding: 8px 16px;
}

.q-item__section {
  min-width: 0px !important;
}

.exansion-title {
  margin-left: 8px;
  font-weight: 400;
  font-size: 16px;
  line-height: 19px;
}

.active-item {
  border: 1px solid $astar-blue;
}

.expansion-list {
  width: 100%;
  padding-left: 24px;
  padding-right: 18px;
}

.ic-item {
  width: 100%;
  background: #fff;
  margin: 16px;
  min-height: 40px;
  border-radius: 6px;
  &:focus {
    border: 1px solid $astar-blue;
  }

  .icon {
    margin-right: 8px;
  }
}

.header-icon {
  width: 20px;
  color: $gray-5-selected;
}

.icon {
  width: 20px;
  color: $astar-blue;
}

.item-name {
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  color: $gray-5-selected;
  // margin-left: 8px;
}

.wrapper--option {
  // margin: 16px;

  .q-expansion-item {
    padding: 0 !important;
    margin-left: 16px;
    margin-top: 16px;
    margin-bottom: 16px;
  }

  .ic-item {
    width: 98%;
    margin: 0px;
    margin-top: 16px;
    margin-left: 16px;
    margin-right: 16px;
  }

  // .item--sub {
  //   margin: 0px;
  //   margin-top: 8px;
  //   margin-left: 16px;
  //   margin-right: 16px;
  // }
}

.button--close {
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  display: flex;
  margin: 16px;
  padding-bottom: 40px;
  justify-content: center;
  color: $gray-5-selected;
  cursor: pointer;
}

.body--dark {
  .wrapper {
    background: $gray-6;
    box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.25);
  }

  .active-item {
    border: 1px solid $astar-blue;
  }

  .ic-item {
    background: rgba(255, 255, 255, 0.05);
  }

  .item-name {
    color: $gray-1;
  }

  .header-icon {
    color: #fff;
  }

  .button--close {
    color: $gray-1;
  }
}
</style>
