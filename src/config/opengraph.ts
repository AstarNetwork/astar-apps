export const opengraphMeta = (displayName: string, networkName: string) => {
  return {
    ogTitle: {
      property: 'og:title',
      template() {
        return `${networkName} Portal - ${displayName}`;
      },
    },
    ogDescription: {
      property: 'og:description',
      template() {
        return `Your one-stop platform for the ${networkName} ecosystem - Wallet / Staking / Bridging`;
      },
    },
    ogSiteName: {
      property: 'og:site_name',
      template() {
        return `${networkName} Portal`;
      },
    },
  };
};
