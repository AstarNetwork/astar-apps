<template>
  <div>
    <template v-if="width >= screenSize.lg">
      <div class="table-container">
        <table id="my-table">
          <thead>
            <tr>
              <th>dApps</th>
              <th>Staked Amount</th>
              <th>Total Earned</th>
              <th>Manage</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in items" :key="t.id">
              <td>{{ t.name }}</td>
              <td>{{ t.stakedAmount.toLocaleString() }} ASTR</td>
              <td>{{ t.totalEarned.toLocaleString() }} ASTR</td>
              <td>
                <div class="row--manage">
                  <astar-button width="97" height="24" :disabled="!t.isEnabled">Add</astar-button>
                  <astar-button width="97" height="24" :disabled="!t.isEnabled"
                    >Unbond</astar-button
                  >
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    <template v-else>
      <DropdownList :items="items" />
    </template>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { useBreakpoints } from 'src/hooks';
import DropdownList from './components/DropdownList.vue';

export default defineComponent({
  components: { DropdownList },
  setup() {
    const { width, screenSize } = useBreakpoints();

    //TODO: need refactor as module
    const items = [
      {
        id: 0,
        name: 'Astar Degens',
        stakedAmount: 10000,
        totalEarned: 2000.12,
        isEnabled: true,
      },
      {
        id: 1,
        name: 'ArthSwap',
        stakedAmount: 10000,
        totalEarned: 2000.12,
        isEnabled: true,
      },
      {
        id: 2,
        name: 'Starlay Finance',
        stakedAmount: 10000,
        totalEarned: 2000.12,
        isEnabled: false,
      },
    ];

    return {
      width,
      screenSize,
      items,
    };
  },
});
</script>
<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.table-container {
  background: $gray-1;
  height: 320px;
  margin-top: 34px;
  padding: 40px;
  border-radius: 6px;
}

table {
  border-collapse: collapse;
  width: 100%;
  float: left;
  thead {
    th {
      padding: 20px 24px;
      font-weight: 600;
      font-size: 14px;
      text-align: left;
      color: $gray-4;
      background: rgba(0, 0, 0, 0.02);
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid $object-light;
      td {
        color: $gray-5-selected;
        font-weight: 600;
        font-size: 14px;
      }
    }
  }

  .row--manage {
    display: flex;
    gap: 8px;
  }

  @media (min-width: $lg) {
    min-width: 720px;
  }
}

@mixin table-desktop {
  display: table;
  border: hidden;

  th,
  td {
    display: table-cell;
  }

  tr {
    display: table-row;
    float: none;
    margin: 0;
    box-shadow: none;

    td {
      padding: 20px 24px;
      float: none;
      width: auto;

      &:before {
        padding: 0 !important;
      }
    }
  }

  thead {
    display: table-header-group;
  }

  tbody,
  tfoot {
    display: table-row-group;
  }

  tr:nth-of-type(even) {
    background: none;
  }
}

#my-table {
  @include table-desktop;
}

.body--dark {
  .table-container {
    background: $gray-6;
  }

  table {
    thead {
      th {
        background: rgba(255, 255, 255, 0.02);
        color: $gray-3;
      }
    }

    tbody {
      tr {
        border-bottom: 1px solid $gray-5;
        box-shadow: none;
        td {
          color: $gray-1;
        }
      }
    }
  }
}
</style>
