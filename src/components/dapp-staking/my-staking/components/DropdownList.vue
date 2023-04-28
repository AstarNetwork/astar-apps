<template>
  <div class="wrapper">
    <q-list>
      <q-expansion-item
        v-for="item in items"
        :key="item.address"
        :header-style="isDarkTheme ? classes.defaultHeaderDark : classes.defaultHeader"
      >
        <template #header>
          <astar-icon-base class="header-icon tw-ml-1 tw-mt-2">
            <astar-icon-community />
          </astar-icon-base>
          <q-item-section class="exansion-title"> {{ item.name }} </q-item-section>
        </template>
        <template v-if="isUnbonding">
          <unbonding-item :item="item" />
        </template>
        <template v-else>
          <my-dapp-item :item="item" />
        </template>
      </q-expansion-item>
    </q-list>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, PropType } from 'vue';
import { useStore } from 'src/store';
import MyDappItem from '../items/MyDappItem.vue';
import UnbondingItem from '../items/UnbondingItem.vue';

export default defineComponent({
  components: { MyDappItem, UnbondingItem },
  props: {
    isUnbonding: {
      type: Boolean,
      default: false,
    },
    items: {
      type: Array as PropType<any[]>,
      default: null,
    },
  },
  setup() {
    const store = useStore();
    const isDarkTheme = computed<boolean>(() => store.getters['general/theme'] === 'DARK');
    const classes = reactive({
      defaultHeader:
        'min-height: 56px; background: #f7f7f8; font-weight: 600; font-size: 14px; padding: 0; padding-left: 8px; padding-right: 8px; border-radius: 6px;',
      defaultHeaderDark:
        'min-height: 56px; background: #191d1f; font-weight: 600; font-size: 14px; padding: 0; padding-left: 8px; padding-right: 8px; border-radius: 6px;',
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

  .active-header {
    border-bottom-left-radius: 0px;
    border-top-right-radius: 6px;
  }
}
.header-icon {
  width: 20px;
  color: $navy-1;
  margin-right: 6px;
}
</style>
