export const navigateInNewTab = (url: string): void => {
  window.open(url, '_blank', 'noopener noreferrer');
};
