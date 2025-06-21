const sanitizeUrl = (url: string): string => url.replace(/[^-A-Za-z0-9+&@#/%?=~_|!:,.;()]/g, '');

export const navigateInNewTab = (url: string): void => {
  window.open(sanitizeUrl(url), '_blank', 'noopener noreferrer');
};
