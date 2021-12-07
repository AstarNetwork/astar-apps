<template>
  <div>
    <q-input
      v-model="data.forumUrl"
      outlined
      label="Astar forum post link"
      maxlength="500"
      :rules="[
        (v) => (v && v.length > 0) || 'Astar forum post link is required.',
        (v) => isUrlValid(v) || 'Invalid url.',
      ]"
      class="tw-my-2"
    />
    <q-input
      v-model="data.gitHubUrl"
      outlined
      label="GitHub url"
      maxlength="500"
      :rules="[
        (v) => (v && v.length > 0) || 'GitHub url is required.',
        (v) => isUrlValid(v) || 'Invalid url.',
      ]"
      class="tw-my-2"
    />
    <q-input
      v-model="data.authorContact"
      outlined
      label="Author contact email"
      maxlength="500"
      :rules="[
        (v) => (v && v.length > 0) || 'Author contact email is required.',
        (v) => isEmailValid(v) || 'Email address is invalid.',
      ]"
      class="tw-my-2"
    />
    <q-select
      v-model="data.license"
      outlined
      :options="licenseTypes"
      label="License type"
      class="tw-my-2"
      :rules="[(v) => v !== undefined || 'Select a license type.']"
    />
  </div>
</template>
<script lang="ts">
import { NewDappItem } from 'src/store/dapps-store/state';
import { defineComponent, PropType, reactive } from 'vue';
import { isEmailValid, isUrlValid } from 'src/components/common/Validators';

export default defineComponent({
  props: {
    value: {
      type: Object as PropType<NewDappItem>,
      required: true,
    },
  },
  setup(props) {
    const data = reactive<NewDappItem>(props.value);
    const licenseTypes = ['GPL-3.0 License', 'MIT'];

    return {
      data,
      licenseTypes,
      isEmailValid,
      isUrlValid,
    };
  },
});
</script>
