<template>
  <astar-default-modal
    v-if="show"
    :show="show"
    :is-closing="isClosingModal"
    :width="580"
    :class="'highest-z-index'"
    @close="closeModal()"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  >
    <img
      :src="require('/src/assets/img/yoki-origins-background.png')"
      alt=""
      class="bg--modal-yoki-origins"
    />

    <div class="title--yoki-origins">
      {{ $t('modals.yokiOrigins.introducing') }}
    </div>
    <div class="logo--yoki-origins">
      <img :src="require('/src/assets/img/yoki-origins-logo.png')" :style="imageStyle" alt="" />
    </div>

    <div class="button--experience-now">
      <a :href="modals.yokiOrigins.experienceNow" target="_blank" rel="noopener noreferrer">
        {{ $t('modals.yokiOrigins.experienceNow') }}
      </a>
    </div>

    <div class="bottoms--yoki-origins">
      <a :href="modals.yokiOrigins.learnMore" target="_blank" rel="noopener noreferrer">
        {{ $t('modals.yokiOrigins.learnMore') }}
      </a>
      <router-link :to="RoutePath.Assets" @click="closeModal">
        {{ $t('modals.yokiOrigins.keep') }}
      </router-link>
    </div>
  </astar-default-modal>
</template>

<script lang="ts">
import { wait } from '@astar-network/astar-sdk-core';
import { fadeDuration } from '@astar-network/astar-ui';
import { defineComponent, ref } from 'vue';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { Path as RoutePath } from 'src/router/routes';
import { modals } from 'src/links';
export default defineComponent({
  components: {},
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    setIsOpen: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const isClosingModal = ref<boolean>(false);
    const closeModal = async (): Promise<void> => {
      isClosingModal.value = true;
      await wait(fadeDuration);
      props.setIsOpen(false);
      isClosingModal.value = false;
      localStorage.setItem(LOCAL_STORAGE.CLOSE_YOKI_ORIGINS_MODAL, 'true');
    };
    if (localStorage.getItem(LOCAL_STORAGE.CLOSE_YOKI_ORIGINS_MODAL)) {
      closeModal();
    }
    const learnMore = (): void => {
      window.open(modals.yokiOrigins.learnMore, '_blank');
    };
    const experienceNow = (): void => {
      window.open(modals.yokiOrigins.experienceNow, '_blank');
    };
    return {
      isClosingModal,
      modals,
      RoutePath,
      learnMore,
      experienceNow,
      closeModal,
    };
  },
  data() {
    return {
      // Add reactive properties for image positioning
      moveX: 0,
      moveY: 0,
    };
  },
  computed: {
    imageStyle() {
      // Use these properties to create a dynamic style for the image
      return {
        transform: `translate(${this.moveX}px, ${this.moveY}px)`,
      };
    },
  },
  methods: {
    handleMouseMove(event: MouseEvent) {
      const { width, height, top, left } = this.$el.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      const mouseX = event.clientX - centerX;
      const mouseY = event.clientY - centerY;

      // These factors determine the parallax movement speed
      const factorX = 0.05;
      const factorY = 0.05;

      this.moveX = mouseX * factorX;
      this.moveY = mouseY * factorY;
    },
    handleMouseLeave() {
      // Method to reset image position on mouse leave
      this.moveX = 0;
      this.moveY = 0;
    },
  },
});
</script>

<style lang="scss">
.modal-content {
  position: relative;
  overflow: hidden;
}
</style>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Laila:wght@700&display=swap');

.button--experience-now {
  text-align: center;
  z-index: 1;
  position: relative;
  a {
    font-family: 'Laila', serif;
    display: inline-block;
    background-color: $navy-1;
    color: $white;
    border-radius: 9999px;
    padding: 12px 24px;
    min-width: 300px;
    font-size: 24px;
    text-align: center;
    font-weight: 700;
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    &:hover {
      background-color: $navy-3;
    }
  }
}

.bottoms--yoki-origins {
  z-index: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  padding: 12px 12px 40px 12px;
  @media (min-width: $sm) {
    flex-direction: row;
    padding: 12px;
  }
  a {
    display: inline-block;
    background-color: rgba(white, 0.8);
    color: $navy-1;
    border-radius: 9999px;
    padding: 16px 24px;
    min-width: 200px;
    font-size: 16px;
    text-align: center;
    font-weight: 700;
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    &:hover {
      background-color: white;
    }
  }
}

.title--yoki-origins {
  z-index: 1;
  position: relative;
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  color: $navy-1;
}

.logo--yoki-origins {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 12px 0;
}

.logo--yoki-origins img {
  transition: transform 0.5s ease-out; /* Adjust the duration and easing as needed */
}

.bg--modal-yoki-origins {
  position: absolute;
  top: 0;
  left: 0;
  object-fit: cover;
  width: 100%;
  height: 100%;
}
</style>
