import { ref, Ref, watchEffect } from 'vue';
import store from 'store';
import type { ApiPromise } from '@polkadot/api';
import type {
  InjectedExtension,
  InjectedMetadataKnown,
  MetadataDef,
} from '@polkadot/extension-inject/types';
import { LOCAL_STORAGE } from 'src/config/localStorage';

interface ExtensionKnown {
  extension: InjectedExtension;
  known: InjectedMetadataKnown[];
  update: (def: MetadataDef) => Promise<boolean>;
}

interface ExtensionInfo extends ExtensionKnown {
  current: InjectedMetadataKnown | null;
}

export interface Extensions {
  count: number;
  extensions: ExtensionInfo[];
}

interface ExtensionProperties {
  extensionVersion: string;
  tokenDecimals: number;
  tokenSymbol: string;
  ss58Format?: number;
}

interface SavedProperties {
  [name: string]: ExtensionProperties;
}

// save the properties for a specific extension
function saveProperties(api: ApiPromise, { name, version }: InjectedExtension): void {
  const storeKey = `properties:${api.genesisHash.toHex()}`;
  const allProperties = store.get(storeKey, {}) as SavedProperties;

  allProperties[name] = {
    extensionVersion: version,
    ss58Format: api.registry.chainSS58,
    tokenDecimals: api.registry.chainDecimals[0],
    tokenSymbol: api.registry.chainTokens[0],
  };

  store.set(storeKey, allProperties);
}

// determines if the extension has current properties
function hasCurrentProperties(api: ApiPromise, { extension }: ExtensionKnown): boolean {
  const allProperties = store.get(`properties:${api.genesisHash.toHex()}`, {}) as SavedProperties;

  // when we don't have properties yet, assume nothing has changed and store
  if (!allProperties[extension.name]) {
    saveProperties(api, extension);

    return true;
  }

  const { ss58Format, tokenDecimals, tokenSymbol } = allProperties[extension.name];

  return (
    ss58Format === api.registry.chainSS58 &&
    tokenDecimals === api.registry.chainDecimals[0] &&
    tokenSymbol === api.registry.chainTokens[0]
  );
}

// filter extensions based on the properties we have available
function filterAll(api: ApiPromise, all: ExtensionKnown[]): Extensions {
  const extensions = all
    .map((info): ExtensionInfo | null => {
      // Memo: Talisman and Mathwallet return null
      const current = info.known.find(({ genesisHash }) => api.genesisHash.eq(genesisHash)) || null;
      const isUpgradable =
        !Boolean(localStorage.getItem(LOCAL_STORAGE.HAS_RAW_METADATA_V15)) ||
        (current && api.runtimeVersion.specVersion.gtn(current.specVersion)) ||
        !hasCurrentProperties(api, info);

      return isUpgradable ? { ...info, current } : null;
    })
    .filter((info): info is ExtensionInfo => !!info);

  return {
    count: extensions.length,
    extensions,
  };
}

async function getExtensionInfo(
  api: ApiPromise,
  extension: InjectedExtension
): Promise<ExtensionKnown | null> {
  if (!extension.metadata) {
    return null;
  }

  try {
    const metadata = extension.metadata;
    const known = await metadata.get();

    return {
      extension,
      known,
      update: async (def: MetadataDef): Promise<boolean> => {
        let isOk = false;

        try {
          isOk = await metadata.provide(def);

          if (isOk) {
            saveProperties(api, extension);
          }

          localStorage.setItem(LOCAL_STORAGE.HAS_RAW_METADATA_V15, 'true');
        } catch (error) {
          // ignore
          console.error('e', error);
        }

        return isOk;
      },
    };
  } catch (error) {
    return null;
  }
}

// // eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getKnown(
  api: ApiPromise,
  extensions: InjectedExtension[]
): Promise<ExtensionKnown[]> {
  const all = await Promise.all(extensions.map((extension) => getExtensionInfo(api, extension)));

  return all.filter((info): info is ExtensionKnown => !!info);
}

export function useMetaExtensions(
  api: ApiPromise,
  extensions: Ref<InjectedExtension[] | undefined>
) {
  if (!api || !extensions) return;

  const metaExtensions = ref<any>(null);
  const extensionCount = ref<number>(0);

  watchEffect(async () => {
    if (extensions.value) {
      await api.isReady;
      const all = await getKnown(api, extensions.value);
      metaExtensions.value = filterAll(api, all);
      extensionCount.value = metaExtensions.value.count;
    }
  });

  return { metaExtensions, extensionCount };
}
