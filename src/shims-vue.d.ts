// Mocks all files ending in `.vue` showing them as plain Vue instances
// Updated to solve problems with Jest according to https://github.com/vuejs/test-utils/issues/194
declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent;
  export default component;
}
