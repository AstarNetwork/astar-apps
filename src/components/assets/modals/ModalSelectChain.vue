<template>
  <div class="wrapper--select-chain">
    <div class="row__chain" :class="isEnableSetChain && 'cursor-pointer'" @click="isOpen = true">
      <img :src="chain.img" alt="chain-logo" class="logo" />
      <input
        v-click-away="closeOption"
        :value="chain.name"
        class="input--chain text--title"
        :class="isEnableSetChain && 'cursor-pointer'"
        type="text"
        spellcheck="false"
        :readonly="true"
      />
      <astar-icon-base
        v-if="isEnableSetChain"
        class="icon--selector"
        icon-name="selector"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <astar-icon-solid-selector />
      </astar-icon-base>
    </div>

    <div v-if="isOpen && isEnableSetChain" class="box--chain-option">
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
    isEnableSetChain: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    const isOpen = ref<boolean>(false);

    const closeOption = (): void => {
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
