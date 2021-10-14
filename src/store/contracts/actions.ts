import { ActionTree } from 'vuex';
import { ApiPromise } from '@polkadot/api';
import { StateInterface } from '../index';
import { ContractsStateInterface as State, CodeJson } from './state';
import type { Hash } from '@polkadot/types/interfaces';
import { Abi } from '@polkadot/api-contract';
import { isString } from '@polkadot/util';
import store from 'store';

interface SaveCode {
  api: ApiPromise;
  _codeHash: string | Hash;
  partial: Partial<CodeJson>;
}

const KEY_CODE = 'code:';

const getCodeJson = (api: ApiPromise, json: CodeJson): any => {
  return {
    contractAbi: json.abi ? new Abi(json.abi, api.registry.getChainProperties()) : undefined,
    json,
  };
};

const actions: ActionTree<State, StateInterface> = {
  loadAllContracts({ commit }, param: any) {
    try {
      const api: ApiPromise = param.api;
      const genesisHash = api.genesisHash?.toHex();

      console.log('genesisHash', genesisHash);

      store.each((json: CodeJson, key: string): void => {
        if (json && json.genesisHash === genesisHash && key.startsWith(KEY_CODE)) {
          const newJson = getCodeJson(api, json);
          commit('addCode', JSON.stringify(newJson));
        }
      });
    } catch (e) {
      console.error('Unable to load code', e);
    }
  },
  saveCode({ commit, state }, { api, _codeHash, partial }: SaveCode) {
    const hash: Hash = isString(_codeHash) ? api.registry.createType('Hash', _codeHash) : _codeHash;
    const codeHash = hash.toHex();
    const existing = state.allCode[codeHash];
    const json = {
      ...(existing ? existing.json : {}),
      ...partial,
      codeHash,
      genesisHash: api.genesisHash.toHex(),
      whenCreated: existing?.json.whenCreated || Date.now(),
    };
    const key = `${KEY_CODE}${json.codeHash}`;

    console.log('key', key);
    console.log('json', json);

    store.set(key, json);
    const newJson = getCodeJson(api, json as CodeJson);

    commit('addCode', JSON.stringify(newJson));
  },
  forgetCode({ commit }, { codeHash }) {
    const key = `${KEY_CODE}${codeHash}`;
    store.remove(key);
    commit('removeCode', codeHash);
  },
};

export default actions;
