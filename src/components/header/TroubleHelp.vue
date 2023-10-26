<template>
  <div>
    <button type="button" class="btn--help" @click="setShowModal(true)">
      <div class="icon--help">
        <!-- TODO: will move icon to the AstarUI -->
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.6048 7.37424C14.6048 6.60107 14.3463 5.98007 13.8292 5.51124C13.3121 5.04242 12.6296 4.80801 11.7817 4.80801C11.2448 4.80801 10.7689 4.91756 10.3539 5.13666C9.93891 5.35577 9.58069 5.68563 9.27922 6.12624C9.10147 6.37715 8.86397 6.52541 8.56672 6.57103C8.26946 6.61665 8.00974 6.54402 7.78755 6.35315C7.623 6.21028 7.52901 6.03109 7.50559 5.8156C7.48217 5.60011 7.53232 5.39573 7.65602 5.20244C8.13165 4.4833 8.71987 3.93644 9.42068 3.56187C10.1215 3.18729 10.9085 3 11.7817 3C13.1761 3 14.3111 3.39919 15.1867 4.19757C16.0622 4.99593 16.5 6.03562 16.5 7.31663C16.5 7.99494 16.3547 8.61653 16.064 9.18139C15.7734 9.74627 15.2779 10.3541 14.5777 11.0048C13.9219 11.599 13.4745 12.0814 13.2355 12.4518C12.9965 12.8221 12.8578 13.2384 12.8194 13.7007C12.7809 13.9672 12.6704 14.1893 12.4879 14.3669C12.3053 14.5446 12.0855 14.6335 11.8285 14.6335C11.5715 14.6335 11.3517 14.5455 11.1691 14.3697C10.9866 14.1938 10.8953 13.9774 10.8953 13.7205C10.8953 13.0938 11.0385 12.5208 11.325 12.0015C11.6114 11.4823 12.091 10.9237 12.7636 10.3258C13.4818 9.69555 13.9682 9.16971 14.2228 8.74831C14.4775 8.32691 14.6048 7.86889 14.6048 7.37424ZM11.7817 20C11.3985 20 11.0685 19.8616 10.7917 19.5849C10.5149 19.3082 10.3765 18.9783 10.3765 18.5954C10.3765 18.2124 10.5149 17.8825 10.7917 17.6058C11.0685 17.3291 11.3985 17.1907 11.7817 17.1907C12.1648 17.1907 12.4948 17.3291 12.7716 17.6058C13.0485 17.8825 13.1869 18.2124 13.1869 18.5954C13.1869 18.9783 13.0485 19.3082 12.7716 19.5849C12.4948 19.8616 12.1648 20 11.7817 20Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <q-tooltip>
        <span class="text--tooltip">{{ $t('help') }}</span>
      </q-tooltip>
    </button>
    <modal-connection-trouble v-if="showModal" :set-is-open="setShowModal" :show="showModal" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useBreakpoints } from 'src/hooks';
import ModalConnectionTrouble from 'src/components/common/ModalConnectionTrouble.vue';

export default defineComponent({
  components: { ModalConnectionTrouble },
  setup() {
    const { width, screenSize } = useBreakpoints();
    const showModal = ref<boolean>(false);
    const setShowModal = (isOpen: boolean): void => {
      showModal.value = isOpen;
    };
    return {
      width,
      screenSize,
      showModal,
      setShowModal,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';
@import 'src/css/utils.scss';

.btn--help {
  width: 32px;
  height: 32px;
  color: white;
  border: solid 1px white;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 16px;
  transition: all 0.2s ease;
  &:hover {
    border-color: $astar-blue;
    background-color: $astar-blue;
  }
  @media (min-width: $lg) {
    width: 40px;
    height: 40px;
    border-radius: 20px;
  }
}
.icon--help {
  svg {
    width: 20px;
    height: 20px;
    @media (min-width: $lg) {
      width: 24px;
      height: 24px;
    }
  }
}
</style>
