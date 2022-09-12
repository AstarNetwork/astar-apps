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
        <div class="panel--item">
          <table>
            <thead>
              <tr>
                <th>Staked Amount</th>
                <th>Total Earned</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>10,000 ASTR</td>
                <td>10,000 ASTR</td>
              </tr>
            </tbody>
          </table>
          <div class="row--manage">
            <astar-button width="97" height="24">Add</astar-button>
            <astar-button width="97" height="24">Unbond</astar-button>
          </div>
        </div>
      </q-expansion-item>
    </q-list>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, reactive } from 'vue';
import { useStore } from 'src/store';

export default defineComponent({
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
}
.header-icon {
  width: 20px;
  color: $gray-5-selected;
  margin-right: 6px;
}

.panel--item {
  background: $gray-1;
  padding: 8px;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
  table {
    width: 100%;

    thead {
      th {
        text-align: left;
        background: #fff;
        color: #9da3ae;
        font-weight: 600;
        font-size: 12px;
        padding: 8px;
      }
    }

    tbody {
      tr {
        background: $gray-1;
        td {
          padding: 19px 8px;
          font-weight: 600;
          font-size: 14px;
        }
      }
    }
  }

  .row--manage {
    display: flex;
    gap: 8px;
    justify-content: right;
    margin-bottom: 10px;
    margin-right: 8px;
  }
}

.body--dark {
  .panel--item {
    background: $gray-6;
    table {
      thead {
        th {
          background: $gray-5-selected-dark;
        }
      }

      tbody {
        tr {
          background: $gray-6;
        }
      }
    }
  }
}
</style>