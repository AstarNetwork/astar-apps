<template>
  <astar-default-modal
    v-if="show"
    :show="show"
    :is-closing="isClosingModal"
    :width="580"
    :class="'highest-z-index'"
    @close="closeModal()"
  >
    <div class="bg--modal-yoki-origins">
      <img :src="require('/src/assets/img/yoki-origins-background.png')" alt="" />
    </div>
    <div @mousemove="handleMouseMove" @mouseleave="handleMouseLeave">
      <div>
        <div class="title--yoki-origins">
          {{ $t('modals.yokiOrigins.introducing') }}
        </div>
        <div class="logo--yoki-origins">
          <img :src="require('/src/assets/img/yoki-origins-logo.png')" :style="imageStyle" alt="" />
        </div>
      </div>
      <div class="bottom--yoki-origins">
        <div class="">
          <q-chip dense size="35px" color="grey-9" text-color="white" @click="experienceNow()">
            {{ $t('modals.yokiOrigins.experienceNow') }}
          </q-chip>
        </div>
        <div class="q-pa-md">
          <q-chip size="lg" @click="learnMore()">
            {{ $t('modals.yokiOrigins.learnMore') }}
          </q-chip>
          <q-chip size="lg" @click="closeModal()">
            {{ $t('modals.yokiOrigins.keep') }}
          </q-chip>
        </div>
      </div>
    </div>
  </astar-default-modal>
</template>

<script lang="ts">
import { wait } from '@astar-network/astar-sdk-core';
import { fadeDuration } from '@astar-network/astar-ui';
import { defineComponent, ref } from 'vue';
import { LOCAL_STORAGE } from 'src/config/localStorage';
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
      console.log('learnMore');
      window.open(modals.yokiOrigins.learnMore, '_blank');
    };
    const experienceNow = (): void => {
      console.log('experienceNow');
      window.open(modals.yokiOrigins.experienceNow, '_blank');
    };
    return {
      isClosingModal,
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
      const factorX = 0.15;
      const factorY = 0.15;

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
  display: flex;
  flex-direction: column;
}

.modal-header {
  margin-bottom: 0px !important;
}

.modal--close {
  background-color: white !important;
}

.bottom--yoki-origins {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
}

.title--yoki-origins {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  align-items: center;
  justify-content: center;
}

.logo--yoki-origins {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo--yoki-origins img {
  transition: transform 0.5s ease-out; /* Adjust the duration and easing as needed */
}

.q-chip__content {
  cursor: pointer;
}

.bg--modal-yoki-origins {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 20px;
}

.bg--modal-yoki-origins img {
  border-radius: 20px;
  overflow: hidden;
}
</style>
