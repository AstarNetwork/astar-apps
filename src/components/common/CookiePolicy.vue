<template>
  <div v-if="open" class="fixed-bottom q-pa-md q-gutter-sm">
    <q-banner rounded class="bg-purple-8 text-white">
      {{ $t('cookiePolicy') }}
      <template #action>
        <q-btn flat color="white" label="Accept All" @click="accept" />
        <q-btn flat color="white" label="Learn More" @click="clickLearnMore" />
      </template>
    </q-banner>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import { LOCAL_STORAGE } from 'src/config/localStorage';

export default defineComponent({
  setup(props) {
    const open = ref(true);

    if (localStorage.getItem(LOCAL_STORAGE.CONFIRM_COOKIE_POLICY)) {
      open.value = false;
    }

    const accept = () => {
      localStorage.setItem(LOCAL_STORAGE.CONFIRM_COOKIE_POLICY, 'true');
      open.value = false;
    };

    const clickLearnMore = () => {
      window.open(
        'https://docs.google.com/document/d/1jEbhRfh292TahRMRdeN4z-8MYNU27dCS_vVopV6xQgk/edit?usp=sharing',
        '_blank'
      );
    };

    return { open, accept, clickLearnMore };
  },
});
</script>