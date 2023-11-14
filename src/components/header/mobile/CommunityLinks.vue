<template>
  <div class="wrapper--community">
    <div class="text--title">Astar Network is owned by the community</div>

    <div class="container--links">
      <a :href="socialUrl.discord" target="_blank" rel="noopener noreferrer">
        <div class="menu-item">
          <astar-icon-base class="icon" viewBox="0 0 448 512" icon-name="Discord">
            <astar-icon-discord />
          </astar-icon-base>
        </div>
        <span>{{ $t('sidenavi.discord') }}</span>
      </a>
      <a :href="socialUrl.twitter" target="_blank" rel="noopener noreferrer">
        <div class="menu-item">
          <astar-icon-base class="icon" viewBox="0 0 448 512" icon-name="Twitter">
            <astar-icon-twitter />
          </astar-icon-base>
        </div>
        <span>{{ $t('sidenavi.twitter') }}</span>
      </a>
      <a :href="socialUrl.telegram" target="_blank" rel="noopener noreferrer">
        <div class="menu-item">
          <astar-icon-base class="icon" viewBox="0 0 448 512" icon-name="Telegram">
            <astar-icon-telegram />
          </astar-icon-base>
        </div>
        <span>{{ $t('sidenavi.telegram') }}</span>
      </a>
      <a :href="socialUrl.reddit" target="_blank" rel="noopener noreferrer">
        <div class="menu-item">
          <astar-icon-base class="icon community-icon" icon-name="Reddit">
            <astar-icon-reddit />
          </astar-icon-base>
        </div>
        <span>{{ $t('sidenavi.reddit') }}</span>
      </a>
      <a :href="socialUrl.youtube" target="_blank" rel="noopener noreferrer">
        <div class="menu-item">
          <astar-icon-base class="icon community-icon" icon-name="YouTube">
            <astar-icon-youtube />
          </astar-icon-base>
        </div>
        <span>{{ $t('sidenavi.youtube') }}</span>
      </a>
      <a :href="socialUrl.github" target="_blank" rel="noopener noreferrer">
        <div class="menu-item">
          <astar-icon-base class="icon" viewBox="0 4 548 512" icon-name="Github">
            <astar-icon-github />
          </astar-icon-base>
        </div>
        <span>{{ $t('sidenavi.github') }}</span>
      </a>
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
<style lang="scss" scoped>
.wrapper--community {
  color: white;
  text-align: center;
  padding: 0 16px;
  margin-bottom: 40px;
}
.text--title {
  font-weight: 900;
  color: white;
  font-size: 24px;
  margin-bottom: 24px;
}

.container--links {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px 12px;
  @media (min-width: $sm) {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
  a {
    .menu-item {
      width: 64px;
      height: 64px;
      background-color: $navy-3;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: $astar-blue;
      margin: auto;
    }
    svg {
      width: 24px;
      height: 24px;
    }
    span {
      font-size: 12px;
      margin-top: 12px;
      display: block;
    }
  }
}
</style>
