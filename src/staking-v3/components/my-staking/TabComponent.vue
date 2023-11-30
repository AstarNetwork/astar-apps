<!--
  Idea behind this component is to be reusable and used through the portal.
  We can move it to Astar-UI if needed.
-->
<template>
  <div class="row--tab">
    <div class="row--mode-tab">
      <div v-for="(tab, index) in tabs" :key="index" class="box--tab">
        <div
          v-if="tab.visible"
          class="tab"
          :class="selectedTabIndex === index ? 'selected-tab text--selected' : 'unselected-tab'"
          @click="handleTabSelected(index)"
        >
          <span class="text--title-tab">{{ tab.title }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType, watch } from 'vue';

export interface TabDefinition {
  title: string;
  visible: boolean;
}

export default defineComponent({
  props: {
    tabs: {
      type: Array<TabDefinition>,
      required: true,
    },
    tabSelected: {
      type: Function as PropType<(index: number) => void> | undefined,
      required: false,
      default: undefined,
    }
  },
  setup(props) {
    const selectedTabIndex = ref<number>(0);

    const handleTabSelected = (index: number) => {
      selectedTabIndex.value = index;
      if (props.tabSelected) {
        props.tabSelected(index);
      }
    }

    watch(() => props.tabs, () => {
      // If the selected tab is not visible, select the first visible tab
      const tab = props.tabs[selectedTabIndex.value];
      if (!tab.visible) {
        for (let i = 0; i < props.tabs.length; i++) {
          if (props.tabs[i].visible) {
            handleTabSelected(i);
            break;
          }
        }
      }
    });

    return { selectedTabIndex, handleTabSelected };
  },
});
</script>

<style lang="scss" scoped>
.row--tab {
  display: flex;
  justify-content: center;
  @media (min-width: $md) {
    justify-content: flex-start;
  }
}

.row--mode-tab {
  display: flex;
}

.tab {
  padding: 16px;
}

.selected-tab {
  color: $navy-1;
  border-bottom: 3px solid $blue;
  transition: all 0.3s ease 0s;
}

.unselected-tab {
  color: $navy-1;
  cursor: pointer;
  transition: all 0.3s ease 0s;
  border-bottom: 3px solid transparent;
}

.text--title-tab {
  font-size: 16px;
}

.text--selected {
  font-weight: 600;
}
</style>
