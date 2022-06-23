<template>
  <div v-if="open" class="fixed-bottom q-pa-md q-gutter-sm">
    <q-banner rounded class="banner text-white">
      Our website uses cookies to enhance site navigation and analyze site usage. Please let us know
      you agree to all of our cookies. You can find out more on our
      <a :href="policyURL" target="_blank">privacy policy page.</a>
      <template #action>
        <q-btn
          class="btnAccept"
          rounded
          color="white"
          text-color="primary"
          label="Accept"
          @click="accept"
        />
      </template>
    </q-banner>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import { LOCAL_STORAGE } from 'src/config/localStorage';

export default defineComponent({
  setup() {
    const policyURL =
      'https://docs.google.com/document/d/1jEbhRfh292TahRMRdeN4z-8MYNU27dCS_vVopV6xQgk/edit?usp=sharing';
    const open = ref(true);

    if (localStorage.getItem(LOCAL_STORAGE.CONFIRM_COOKIE_POLICY)) {
      open.value = false;
    }

    const accept = () => {
      localStorage.setItem(LOCAL_STORAGE.CONFIRM_COOKIE_POLICY, 'true');
      open.value = false;
    };

    return { open, accept, policyURL };
  },
});
</script>
<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';
.banner {
  background: #0085ff;
  max-width: 500px;
  @media (min-width: $sm) {
    margin-left: 240px;
  }

  a {
    text-decoration: underline;
    font-weight: 600;
  }

  .btnAccept {
    font-weight: 700;
    height: 32px;
  }
}
</style>