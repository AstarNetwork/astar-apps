<template>
  <div class="wrapper--select-chain">
    <div class="row__chain" @click="isOpen = true">
      <img :src="chain.img" alt="chain-logo" class="logo" />
      <input
        :value="chain.name"
        class="input--chain text--title"
        type="text"
        spellcheck="false"
        :readonly="true"
        @blur="closeOption"
      />
      <astar-icon-base
        class="icon--selector"
        icon-name="selector"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <astar-icon-solid-selector />
      </astar-icon-base>
    </div>

    <div v-if="isOpen" class="box--chain-option">
      <ul v-for="(c, index) in filteredChains" :key="index" class="container--chain">
        <li role="option" class="list" @click="setChain(c)">
          <div class="list__row">
            <div class="box__row">
              <img width="24" :src="c.img" alt="wallet-icon" />
              <div class="column--chain-name">
                <span class="text--title">{{ c.name }}</span>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
<script lang="ts">
import { wait } from 'src/hooks/helper/common';
import { XcmChain } from 'src/modules/xcm';
import { computed, defineComponent, PropType, ref } from 'vue';

export default defineComponent({
  props: {
    chains: {
      type: Array as PropType<XcmChain[]>,
      required: true,
    },
    chain: {
      type: Object as PropType<XcmChain>,
      required: true,
    },
    setChain: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const isOpen = ref<boolean>(false);

    const closeOption = async (): Promise<void> => {
      // Memo: wait for updating the chain state before closing
      const delay = 200;
      await wait(delay);
      isOpen.value = false;
    };

    const filteredChains = computed(() => {
      return props.chains.filter((it) => it.name !== props.chain.name);
    });

    return {
      isOpen,
      filteredChains,
      closeOption,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/modal-select-chain.scss';
</style>
