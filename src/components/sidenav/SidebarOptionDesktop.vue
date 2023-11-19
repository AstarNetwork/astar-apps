<template>
  <div class="sidebar--container sidebar-text">
    <div class="sidebar-button-container">
      <astar-icon-base class="community-icon">
        <astar-icon-community />
      </astar-icon-base>
      {{ $t('sidenavi.community') }}
      <q-menu anchor="top middle" self="center left">
        <div class="menu-container sidebar-text">
          <a :href="socialUrl.discord" target="_blank">
            <div class="menu-item">
              <astar-icon-base class="icon" viewBox="0 0 448 512" icon-name="Discord">
                <astar-icon-discord />
              </astar-icon-base>
              {{ $t('sidenavi.discord') }}
            </div>
          </a>
          <a :href="socialUrl.twitter" target="_blank">
            <div class="menu-item">
              <astar-icon-base class="icon" viewBox="0 0 448 512" icon-name="Twitter">
                <astar-icon-twitter />
              </astar-icon-base>
              {{ $t('sidenavi.twitter') }}
            </div>
          </a>
          <a :href="socialUrl.telegram" target="_blank">
            <div class="menu-item">
              <astar-icon-base class="icon" viewBox="0 0 448 512" icon-name="Telegram">
                <astar-icon-telegram />
              </astar-icon-base>
              {{ $t('sidenavi.telegram') }}
            </div>
          </a>
          <a :href="socialUrl.reddit" target="_blank">
            <div class="menu-item">
              <astar-icon-base class="icon community-icon" icon-name="Reddit">
                <astar-icon-reddit />
              </astar-icon-base>
              {{ $t('sidenavi.reddit') }}
            </div>
          </a>
          <a :href="socialUrl.youtube" target="_blank">
            <div class="menu-item">
              <astar-icon-base class="icon community-icon" icon-name="YouTube">
                <astar-icon-youtube />
              </astar-icon-base>
              {{ $t('sidenavi.youtube') }}
            </div>
          </a>
          <a :href="socialUrl.github" target="_blank">
            <div class="menu-item">
              <astar-icon-base class="icon" viewBox="0 4 548 512" icon-name="Github">
                <astar-icon-github />
              </astar-icon-base>
              {{ $t('sidenavi.github') }}
            </div>
          </a>
        </div>
      </q-menu>
    </div>
    <a :href="docsUrl.topPage" target="_blank">
      <div class="sidebar-button-container">
        <astar-icon-base class="community-icon">
          <astar-icon-docs />
        </astar-icon-base>
        {{ $t('sidenavi.docs') }}
      </div>
    </a>
    <div class="sidebar-button-container">
      <astar-icon-base>
        <astar-icon-3dots />
      </astar-icon-base>
      {{ $t('sidenavi.settings') }}
      <q-menu anchor="top middle" self="center left" :square="false">
        <div class="menu-container sidebar-text">
          <div class="locale-container"><locale-changer /></div>
          <div class="theme-container">
            <span>{{ $t('sidenavi.theme') }}</span>
            <light-dark-mode />
          </div>
        </div>
      </q-menu>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { socialUrl, docsUrl } from 'src/links';
import LocaleChanger from '../common/LocaleChanger.vue';
import LightDarkMode from '../common/LightDarkMode.vue';

export default defineComponent({
  components: { LocaleChanger, LightDarkMode },
  setup() {
    return { socialUrl, docsUrl };
  },
});
</script>

<style scoped lang="scss">
.sidebar--container {
  padding: 0px 9px;
}

svg {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}

.icon {
  color: $astar-blue;
}

.community-icon {
  margin-top: 7px;
}

.menu-container {
  display: flex;
  flex-direction: column;
  width: 240px;
  padding: 8px;
  border-radius: 6px;
  row-gap: 10px;
  background-color: $navy-1;
}

.sidebar-button-container {
  display: flex;
  align-items: center;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  &:hover {
    background-color: $navy-3;
  }
}

.menu-item {
  display: flex;
  align-items: center;
  border-radius: 6px;
  padding: 10px;
  cursor: pointer;

  &:hover {
    background-color: rgba(255, 255, 255, 0.02);
  }
}

.sidebar-text {
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  color: $gray-1;
}

.theme-container {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 12px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.02);
  }
}

.locale-container {
  padding: 0px 0px;
}
</style>

<style lang="scss">
.q-menu {
  border-radius: 6px;
  background-color: $navy-1;
  color: $gray-1;
  filter: drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.8));
}

.q-field--filled .q-field__control:before {
  border-color: transparent;
}

.q-field--filled:hover .q-field__control:before {
  border-color: transparent;
}

.q-field--filled .q-field__control {
  border-radius: 6px;
}
</style>
