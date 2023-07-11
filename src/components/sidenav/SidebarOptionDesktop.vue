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
              <astar-icon-base class="icon" icon-name="Reddit">
                <astar-icon-reddit />
              </astar-icon-base>
              {{ $t('sidenavi.reddit') }}
            </div>
          </a>
          <a :href="socialUrl.youtube" target="_blank">
            <div class="menu-item">
              <astar-icon-base class="icon" icon-name="YouTube">
                <astar-icon-youtube />
              </astar-icon-base>
              {{ $t('sidenavi.youtube') }}
            </div>
          </a>
          <a :href="socialUrl.github" target="_blank">
            <div class="menu-item">
              <astar-icon-base class="icon" viewBox="0 0 548 512" icon-name="Github">
                <astar-icon-github />
              </astar-icon-base>
              {{ $t('sidenavi.github') }}
            </div>
          </a>
        </div>
      </q-menu>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { socialUrl } from 'src/links';

export default defineComponent({
  components: {},
  setup() {
    return { socialUrl };
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
  width: 240px;
  padding: 8px;
  border-radius: 6px;
  background-color: $navy-1;
  filter: drop-shadow(0px 0px 8px rgba(0, 0, 0, 0.8));
}

.sidebar-button-container {
  display: flex;
  align-items: center;
  background-color: $navy-3;
  border-radius: 6px;
  padding: 10px;
  cursor: pointer;

  &:hover {
    transition: all 0.3s ease 0s;
    background-color: #30393d;
  }
}

.menu-item {
  display: flex;
  align-items: center;
  border-radius: 6px;
  padding: 10px;
  cursor: pointer;
}

.sidebar-text {
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  color: $gray-1;
}
</style>
