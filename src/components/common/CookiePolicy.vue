<template>
  <div v-if="open" class="fixed-bottom q-pa-md q-gutter-sm">
    <q-banner rounded class="banner bg-blue-8 text-white">
      We use cookies to provide you with the best experience and to help improve our website and
      application. Please read our <a :href="policyURL" target="_blank">Privacy Policy</a> for more
      information. By clicking "Accept", you agree to the storing of cookies on your device to
      enhance site navigation, analyze site usage and provide customer support.
      <template #action>
        <q-btn rounded color="white" text-color="primary" label="Accept" @click="accept" />
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
  max-width: 500px;
  @media (min-width: $sm) {
    margin-left: 240px;
  }

  a {
    text-decoration: underline;
    font-weight: 600;
  }
}
</style>