interface ogMeta {
  property: string;
  content: string;
  vmid?: string;
}

export const opengraphMeta: ogMeta[] = [
  {
    property: 'og:title',
    content: 'Astar Portal',
    vmid: 'og:title',
  },
  {
    property: 'og:description',
    content:
      'All in one Astar portal that allows you to transfer your token and manage your application.',
    vmid: 'og:description',
  },
  {
    property: 'og:site_name',
    content: 'Astar Portal',
    vmid: 'og:site_name',
  },
  {
    property: 'og:image',
    content: '',
    vmid: 'og:image',
  },
];
