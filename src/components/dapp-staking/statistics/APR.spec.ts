import { mountFactory } from '@quasar/quasar-app-extension-testing';
import APR from 'src/components/dapp-staking/statistics/APR.vue';

const wrapper = mountFactory(APR);

describe('APR', () => {
  it('creates component wrapper', () => {
    expect(wrapper).toBeDefined();
  });
});
