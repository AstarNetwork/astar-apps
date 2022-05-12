<template>
  <Modal :title="title" class="animate__animated animate__fadeIn" @click="closeModal">
    <template #content>
      <div
        id="virtual-scroll-target"
        class="scroll"
        :style="width > 425 ? 'max-height: 550px' : 'max-height: 250px'"
      >
        <q-virtual-scroll scroll-target="#virtual-scroll-target" :items="chains">
          <template #default="{ item, index }">
            <q-item :key="index" dense>
              <q-item-section>
                <q-item-label>
                  <div class="chain-items animate__animated animate__fadeIn">
                    <Chain
                      :key="index"
                      :chain="item"
                      :select-chain="selectChain"
                      :selected-chain="selectedChain"
                    />
                  </div>
                </q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-virtual-scroll>
      </div>
    </template>
  </Modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Chain from './Chain.vue';
import Modal from 'src/components/common/Modal.vue';
import { useBreakpoints } from 'src/hooks';
export default defineComponent({
  components: {
    Chain,
    Modal,
  },
  props: {
    closeModal: {
      type: Function,
      required: true,
    },
    selectChain: {
      type: Function,
      required: true,
    },
    chains: {
      type: Array,
      required: true,
    },
    modal: {
      type: String,
      required: true,
    },
    selectedChain: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const title = props.modal === 'src' ? 'Select Source Chain' : 'Select Destination Chain';
    const { width } = useBreakpoints();
    return { title, width };
  },
});
</script>

<style lang="scss" scoped>
@import '../styles/bridge-modal';
</style>
