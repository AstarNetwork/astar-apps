import { computed, onMounted, onUnmounted, ref } from 'vue';

export const useBreakpoints = () => {
  const windowWidth = ref<number>(window.innerWidth);
  const screenSize = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    xxl: 1440,
  };

  const onWidthChange = () => (windowWidth.value = window.innerWidth);
  onMounted(() => window.addEventListener('resize', onWidthChange));
  onUnmounted(() => window.removeEventListener('resize', onWidthChange));

  const type = computed(() => {
    if (windowWidth.value < 375) return 'xs';
    if (windowWidth.value >= 375 && windowWidth.value < 768) return 'sm';
    if (windowWidth.value >= 768 && windowWidth.value < 1024) return 'md';
    if (windowWidth.value >= 1024 && windowWidth.value < 1280) return 'lg';
    if (windowWidth.value >= 1024 && windowWidth.value < 1440) return 'xl';
    if (windowWidth.value >= 1440) return 'xxl';
    return null;
  });

  const width = computed(() => windowWidth.value);

  return { width, type, screenSize };
};
