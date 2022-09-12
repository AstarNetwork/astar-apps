<template>
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
        <tr>
          <td>Astar Degens</td>
          <td>10,000 ASTR</td>
          <td>2,000.12 ASTR</td>
          <td>
            <div class="row--manage">
              <astar-button width="97" height="24">Add</astar-button>
              <astar-button width="97" height="24">Unbond</astar-button>
            </div>
          </td>
        </tr>
        <tr>
          <td>ArthSwap</td>
          <td>10,000 ASTR</td>
          <td>2,000.12 ASTR</td>
          <td>
            <div class="row--manage">
              <astar-button width="97" height="24">Add</astar-button>
              <astar-button width="97" height="24">Unbond</astar-button>
            </div>
          </td>
        </tr>
        <tr>
          <td>Starlay Finance</td>
          <td>10,000 ASTR</td>
          <td>2,000.12 ASTR</td>
          <td>
            <div class="row--manage">
              <astar-button width="97" height="24">Add</astar-button>
              <astar-button width="97" height="24">Unbond</astar-button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, ref } from 'vue';

export default defineComponent({
  setup() {},
});
</script>
<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

table {
  border-collapse: collapse;
  width: 100%;
  float: left;
  margin-top: 3em;
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
}

@mixin table-mobile {
  display: block;

  tbody {
    border: none;
  }
  tbody,
  th,
  td,
  tr,
  tfoot {
    display: block;
  }

  thead {
    display: none;
  }
  tr {
    float: left;
    width: 100%;
    margin: 0 0 1em;
    // border: 1px solid $object-light;
    // box-shadow: 0px 2px 5px 0px $object-light;
    border-radius: 10px;

    td {
      padding: 0.5em 0.5em 0.5em 50%;
      float: left;
      width: 100%;
      &:before {
        width: 100%;
        display: block;
        float: left;
        padding: 0.5em 0.5em 0.5em 0;
        clear: both;
        margin: -0.5em 0 0 -100%;
        font-size: 1.125em;
      }
    }
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
  @include table-mobile;
  @media screen and (min-width: $lg) {
    @include table-desktop;
  }
}

.body--dark {
  table {
    thead {
      th {
        background: rgba(255, 255, 255, 0.02);
        color: #9da3ae;
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
