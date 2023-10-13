<template>
  <div class="animate__animated animate__fadeIn flag">
    <div class="balloon_text-box">
      <span class="text--ballon">
        {{ $t('bridge.actionRequired') }}
      </span>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({});
</script>

<style lang="scss" scoped>
@use 'src/components/common/styles/balloon.scss';

.flag {
  position: absolute;
  width: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  top: -48px;
  border-radius: 6px;
  background: transparent;
  border: 1px solid $warning-red;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
}
</style>
