// TODO work on this will be continued in another branch

import { shallowMount } from '@vue/test-utils';
import { QIcon } from 'quasar';
import * as apr from 'src/hooks/useApr';
import APR from 'src/components/dapp-staking/statistics/APR.vue';

const mock = jest.spyOn(apr, 'useApr');
const wrapper = shallowMount(APR, {
  global: {
    components: {
      QIcon,
    },
    mocks: {
      $t: (msg: string) => msg,
    },
  },
});

describe('APR', () => {
  it('calls useApr', () => {
    console.log('in test');
    expect(mock).toBeCalled();
    mock.mockRestore();
  });
});
