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
            d="M15.1836 6.40348C15.1836 5.44838 14.8677 4.68126 14.2357 4.10212C13.6037 3.52299 12.7695 3.23343 11.7331 3.23343C11.0769 3.23343 10.4953 3.36875 9.98808 3.6394C9.48089 3.91007 9.04307 4.31755 8.6746 4.86183C8.45736 5.17177 8.16708 5.35492 7.80376 5.41127C7.44045 5.46763 7.12301 5.37791 6.85146 5.14212C6.65033 4.96563 6.53546 4.74429 6.50684 4.4781C6.47821 4.2119 6.5395 3.95943 6.6907 3.72067C7.27202 2.83232 7.99095 2.15678 8.8475 1.69407C9.70405 1.23136 10.6659 1 11.7331 1C13.4374 1 14.8247 1.49312 15.8948 2.47935C16.9649 3.46557 17.5 4.74988 17.5 6.33231C17.5 7.17022 17.3224 7.93806 16.9671 8.63583C16.6119 9.33362 16.0064 10.0844 15.1505 10.8882C14.349 11.6223 13.8022 12.2182 13.5101 12.6757C13.218 13.1332 13.0484 13.6475 13.0014 14.2185C12.9545 14.5477 12.8194 14.822 12.5963 15.0415C12.3732 15.261 12.1045 15.3708 11.7904 15.3708C11.4763 15.3708 11.2076 15.2621 10.9845 15.0449C10.7614 14.8276 10.6498 14.5603 10.6498 14.2429C10.6498 13.4688 10.8249 12.761 11.175 12.1195C11.5251 11.4781 12.1112 10.7881 12.9333 10.0496C13.8111 9.27098 14.4056 8.6214 14.7168 8.10085C15.028 7.5803 15.1836 7.01451 15.1836 6.40348ZM11.7331 22C11.2649 22 10.8616 21.8291 10.5232 21.4872C10.1848 21.1454 10.0157 20.7379 10.0157 20.2649C10.0157 19.7918 10.1848 19.3843 10.5232 19.0425C10.8616 18.7006 11.2649 18.5297 11.7331 18.5297C12.2014 18.5297 12.6047 18.7006 12.9431 19.0425C13.2814 19.3843 13.4506 19.7918 13.4506 20.2649C13.4506 20.7379 13.2814 21.1454 12.9431 21.4872C12.6047 21.8291 12.2014 22 11.7331 22Z"
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
  border-radius: 14px;
  transition: all 0.2s ease;
  &:hover {
    color: $astar-blue-dark;
    border-color: $astar-blue-dark;
  }
  @media (min-width: $lg) {
    width: 40px;
    height: 40px;
    border-radius: 16px;
  }
}
.icon--help {
  svg {
    width: 18px;
    height: 18px;
    @media (min-width: $lg) {
      width: 20px;
      height: 20px;
    }
  }
}
</style>
