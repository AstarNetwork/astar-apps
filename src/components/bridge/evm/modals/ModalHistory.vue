<template>
  <Modal title="Bridge History" class="animate__animated animate__fadeIn" @click="closeModal">
    <template #content>
      <div v-if="!histories.length" class="no-history">
        <icon-base class="history-icon" icon-name="history">
          <q-icon :name="fasHistory" :color="isDarkTheme ? 'white' : 'blue'" />
        </icon-base>
        <p>{{ $t('bridge.noHistory') }}</p>
      </div>

      <div v-else>
        <div id="virtual-scroll-target" class="scroll" style="max-height: 600px">
          <q-virtual-scroll scroll-target="#virtual-scroll-target" :items="histories">
            <template #default="{ item, index }">
              <q-item :key="index" dense>
                <q-item-section>
                  <q-item-label>
                    <div class="histories">
                      <History :key="index" :history="item" :token-icons="tokenIcons" />
                    </div>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-virtual-scroll>
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
import IconBase from 'components/icons/IconBase.vue';

export default defineComponent({
  components: {
    History,
    Modal,
    IconBase,
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
  },
  setup() {
    const store = useStore();
    const isDarkTheme = computed(() => store.getters['general/theme'] === 'DARK');
    return { fasHistory, isDarkTheme };
  },
});
</script>

<style lang="scss" scoped>
@import '../styles/bridge-modal';
</style>
