// TODO work on this will be continued in another branch

import { shallowMount } from '@vue/test-utils';
import { QIcon } from 'quasar';
import * as apr from 'src/hooks/useApr';
import APR from 'src/components/dapp-staking/statistics/APR.vue';
import { ref } from 'vue';

const getAprWrapper = () => {
  return shallowMount(APR, {
    global: {
      components: {
        QIcon,
      },
      mocks: {
        $t: (msg: string, params: any) => `APR: ${params.value}%`,
      },
    },
  });
};

describe('APR', () => {
  it('calls useApr', () => {
    const mock = jest.spyOn(apr, 'useApr');
    const wrapper = getAprWrapper();

    console.log('in test');
    expect(mock).toBeCalled();
    mock.mockRestore();
  });

  it('renders APR', (done) => {
    const mock = jest.spyOn(apr, 'useApr').mockImplementation(() => {
      return {
        stakerApr: ref<number>(10),
        stakerApy: ref<number>(20),
      };
    });
    const wrapper = getAprWrapper();

    // component fetches data in async way so we need to handle expect in a way below.
    wrapper.vm.$nextTick(() => {
      expect(wrapper.text()).toMatch('APR: 10%');
      done();
    });
  });
});
