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
          <q-item-section class="exansion-title item-name">
            {{ $t('sidenavi.language') }}
          </q-item-section>
        </template>
        <div class="wrapper--sub-item">
          <q-item
            v-for="(lang, i) in langs"
            :key="`Lang${i}`"
            class="ic-item item--sub"
            active-class="ic-item-lang-active"
            :active="$i18n.locale == lang.code"
            clickable
            @click="selectLanguage(lang.code)"
          >
            <q-item-section class="item-name">{{ lang.text }}</q-item-section>
          </q-item>
        </div>
      </q-expansion-item>
      <div>
        <q-item class="ic-item" clickable active-class="active-item">
          <q-item-section class="item-name">{{ $t('sidenavi.theme') }}</q-item-section>
          <light-dark-mode />
        </q-item>
      </div>
      <!-- <div class="button--close" @click="closeMobileNavi">X {{ $t('sidenavi.close') }}</div> -->
    </q-list>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, reactive } from 'vue';
import LightDarkMode from '../common/LightDarkMode.vue';
import { useStore } from 'src/store';
import { CultureCode, languagesSelector } from 'src/i18n';
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
      activeHeaderLight: 'background: #fff;',
      activeHeaderDark: 'background: rgba(255, 255, 255, 0.05);',
    });

    const selectLanguage = (code: CultureCode) => {
      i18n.global.locale.value = code;
    };

    const closeMobileNavi = () => {
      emit('closeNavi');
    };

    const expanded = ref(false);

    return {
      classes,
      expanded,
      isDarkTheme,
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
@import './styles/sidebar-settings.scss';
</style>
