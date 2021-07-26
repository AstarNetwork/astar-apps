<template>
  <sidebar-mobile />
  <sidebar-desktop />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SidebarMobile from './common/SidebarMobile.vue';
import SidebarDesktop from './common/SidebarDesktop.vue';

export default defineComponent({
  components: { SidebarMobile, SidebarDesktop },
});
</script>
