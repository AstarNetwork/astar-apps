<template>
  <div class="card">
    <div class="txt--subtitle">Developer Incentive</div>
    <div class="txt--value">287,712 <span class="txt--flag">ASTR/era</span></div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  setup() {},
});
</script>
<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-basis: 50%;
  background: #d9d9d9;
  height: 127px;
  border-radius: 5px;
  padding: 35px;
  .txt--subtitle {
    font-family: 'Objektiv Mk1';
    font-weight: 800;
    font-size: 16px;
    line-height: 26px;
    color: $gray-3;
  }
  .txt--value {
    font-style: normal;
    font-weight: 800;
    font-size: 32px;
    line-height: 25px;
    background: linear-gradient(
      100.62deg,
      #e6007a -13.87%,
      #703ac2 10.44%,
      #0070eb 47.07%,
      #0297fb 89.31%,
      #0ae2ff 151.16%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;

    .txt--flag {
      font-size: 17.1591px;
      line-height: 21px;
    }
  }

  @media (max-width: $sm) {
    margin-bottom: 20px;
  }
}

.body--dark {
  .card {
    .txt--subtitle {
      color: $gray-1;
    }
  }
}
</style>