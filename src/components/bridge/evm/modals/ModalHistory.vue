<template>
  <Modal title="Bridge History" class="animate__animated animate__fadeIn" @click="closeModal">
    <template #content>
      <div v-if="!histories.length && !isUpdatingHistories" class="no-history">
        <astar-icon-base class="history-icon" icon-name="history">
          <q-icon :name="fasHistory" :color="isDarkTheme ? 'white' : 'blue'" />
        </astar-icon-base>
        <p>{{ $t('bridge.noHistory') }}</p>
        <p>{{ $t('bridge.updateTime', { from: 5, to: 20 }) }}</p>
      </div>

      <div v-else>
        <div v-if="isUpdatingHistories" class="updating-container">
          <q-spinner-ios color="primary" size="80px" />
        </div>
        <div
          v-else
          id="virtual-scroll-target"
          class="scroll list-container"
          :style="width > 425 ? 'height: 600px' : 'height: 250px'"
        >
          <q-virtual-scroll scroll-target="#virtual-scroll-target" :items="histories">
            <template #default="{ item, index }">
              <q-item :key="index" dense>
                <q-item-section>
                  <q-item-label>
                    <div class="history-items animate__animated animate__fadeIn">
                      <History :key="index" :history="item" :token-icons="tokenIcons" />
                    </div>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-virtual-scroll>
        </div>
        <div class="list-footer">
          <span>{{ $t('bridge.updateTime', { from: 5, to: 20 }) }}</span>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useStore } from 'src/store';
import History from './History.vue';
import Modal from 'src/components/common/Modal.vue';
import { fasHistory } from '@quasar/extras/fontawesome-v5';
import { useBreakpoints } from 'src/hooks';

export default defineComponent({
  components: {
    History,
    Modal,
  },
  props: {
    closeModal: {
      type: Function,
      required: true,
    },
    histories: {
      type: Array,
      required: true,
    },
    tokenIcons: {
      type: Array,
      required: true,
    },
    isUpdatingHistories: {
      type: Boolean,
      required: true,
    },
  },
  setup() {
    const store = useStore();
    const isDarkTheme = computed(() => store.getters['general/theme'] === 'DARK');
    const { width } = useBreakpoints();
    return { fasHistory, isDarkTheme, width };
  },
});
</script>

<style lang="scss" scoped>
@import '../styles/bridge-modal';
</style>
