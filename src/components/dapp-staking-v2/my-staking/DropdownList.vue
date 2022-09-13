<template>
  <div class="wrapper">
    <q-list>
      <q-expansion-item
        :header-style="isDarkTheme ? classes.defaultHeaderDark : classes.defaultHeader"
      >
        <template #header>
          <astar-icon-base class="header-icon tw-ml-1 tw-mt-2">
            <astar-icon-community />
          </astar-icon-base>
          <q-item-section class="exansion-title"> Astar Degens </q-item-section>
        </template>
        <template v-if="isUnbonding">
          <UnbondingItem />
        </template>
        <template v-else>
          <MyDappItem />
        </template>
      </q-expansion-item>

      <q-expansion-item
        :header-style="isDarkTheme ? classes.defaultHeaderDark : classes.defaultHeader"
      >
        <template #header>
          <astar-icon-base class="header-icon tw-ml-1 tw-mt-2">
            <astar-icon-community />
          </astar-icon-base>
          <q-item-section class="exansion-title"> Astar Degens </q-item-section>
        </template>
        <template v-if="isUnbonding">
          <UnbondingItem disabled />
        </template>
        <template v-else>
          <MyDappItem disabled />
        </template>
      </q-expansion-item>
    </q-list>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, reactive } from 'vue';
import { useStore } from 'src/store';
import MyDappItem from './items/MyDappItem.vue';
import UnbondingItem from './items/UnbondingItem.vue';

export default defineComponent({
  components: { MyDappItem, UnbondingItem },
  props: {
    isUnbonding: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const store = useStore();
    const isDarkTheme = computed<boolean>(() => store.getters['general/theme'] === 'DARK');
    const classes = reactive({
      defaultHeader:
        'min-height: 56px; background: #f7f7f8; font-weight: 600; font-size: 14px; padding: 0; padding-left: 8px; padding-right: 8px; border-top-left-radius: 6px; border-top-right-radius: 6px;',
      defaultHeaderDark:
        'min-height: 56px; background: #191d1f; font-weight: 600; font-size: 14px; padding: 0; padding-left: 8px; padding-right: 8px; border-top-left-radius: 6px; border-top-right-radius: 6px;',
    });
    return {
      isDarkTheme,
      classes,
    };
  },
});
</script>
<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.wrapper {
  margin-top: 30px;

  .q-expansion-item {
    padding-bottom: 16px;
  }
}
.header-icon {
  width: 20px;
  color: $gray-5-selected;
  margin-right: 6px;
}
</style>