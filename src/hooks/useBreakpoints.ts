import { computed, onMounted, onUnmounted, ref } from 'vue';

export const useBreakpoints = () => {
  const windowWidth = ref<number>(window.innerWidth);

  const onWidthChange = () => (windowWidth.value = window.innerWidth);
  onMounted(() => window.addEventListener('resize', onWidthChange));
  onUnmounted(() => window.removeEventListener('resize', onWidthChange));

  const type = computed(() => {
    if (windowWidth.value < 425) return 'xs';
    if (windowWidth.value >= 425 && windowWidth.value < 768) return 'sm';
    if (windowWidth.value >= 768 && windowWidth.value < 1024) return 'md';
    if (windowWidth.value >= 1024 && windowWidth.value < 1440) return 'lg';
    if (windowWidth.value >= 1440) return 'xl';
    return null;
  });

  const width = computed(() => windowWidth.value);

  return { width, type };
};
