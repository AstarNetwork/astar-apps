import { objToArray } from 'src/hooks/helper/common';
import { Chain, parachainIds, XcmChain } from 'src/v2/models';

export {
  astarNativeTokenErcAddr,
  generateAssetFromEvmToken,
  xcmToken,
} from 'src/modules/xcm/tokens';
export {
  addXcmTxHistories,
  castChainName,
  checkIsAstarNativeToken,
  checkIsDeposit,
  checkIsSupportAstarNativeToken,
  fetchExistentialDeposit,
  fetchXcmBalance,
  getXcmToken,
  monitorBalanceIncreasing,
  removeEvmName,
} from 'src/modules/xcm/utils';

export interface XcmTokenInformation {
  symbol: string;
  assetId: string;
  logo: string;
  isNativeToken: boolean;
  isXcmCompatible: boolean;
  originAssetId: string;
  originChain: string;
  minBridgeAmount: string;
}

export interface ExistentialDeposit {
  amount: string;
  chain: string;
  symbol: string;
  // Memo: minimum balance keeps in relaychain
  originChainMinBal: number;
}

// Memo: give it 0 ide for convenience in checking para/relay chain logic
export const relaychainParaId = 0;

type XcmChainObj = {
  [key in Chain]: XcmChain;
};

export const xcmChainObj: XcmChainObj = {
  [Chain.POLKADOT]: {
    name: Chain.POLKADOT,
    relayChain: Chain.POLKADOT,
    img: require('/src/assets/img/ic_polkadot.png'),
    parachainId: relaychainParaId,
    endpoint: 'wss://polkadot.api.onfinality.io/public-ws',
    subscan: 'https://polkadot.subscan.io',
    isAstarNativeToken: false,
  },
  [Chain.ASTAR]: {
    name: Chain.ASTAR,
    relayChain: Chain.POLKADOT,
    img: require('/src/assets/img/ic_astar.png'),
    parachainId: parachainIds.ASTAR,
    endpoint: 'wss://astar-rpc.dwellir.com',
    subscan: 'https://astar.subscan.io',
    isAstarNativeToken: false,
  },
  [Chain.ASTAR_EVM]: {
    name: Chain.ASTAR_EVM,
    relayChain: Chain.POLKADOT,
    img: require('/src/assets/img/ic_astar.png'),
    parachainId: parachainIds.ASTAR,
    endpoint: 'wss://astar-rpc.dwellir.com',
    subscan: 'https://astar.subscan.io',
    isAstarNativeToken: false,
  },
  [Chain.KUSAMA]: {
    name: Chain.KUSAMA,
    relayChain: Chain.KUSAMA,
    img: require('/src/assets/img/ic_kusama.png'),
    parachainId: relaychainParaId,
    endpoint: 'wss://kusama-rpc.polkadot.io',
    subscan: 'https://kusama.subscan.io',
    isAstarNativeToken: false,
  },
  [Chain.SHIDEN]: {
    name: Chain.SHIDEN,
    relayChain: Chain.KUSAMA,
    img: require('/src/assets/img/ic_shiden.png'),
    parachainId: parachainIds.SHIDEN,
    endpoint: 'wss://shiden-rpc.dwellir.com',
    subscan: 'https://shiden.subscan.io',
    isAstarNativeToken: false,
  },
  [Chain.SHIDEN_EVM]: {
    name: Chain.SHIDEN_EVM,
    relayChain: Chain.KUSAMA,
    img: require('/src/assets/img/ic_shiden.png'),
    parachainId: parachainIds.SHIDEN,
    endpoint: 'wss://shiden-rpc.dwellir.com',
    subscan: 'https://shiden.subscan.io',
    isAstarNativeToken: false,
  },
  [Chain.STATEMINE]: {
    name: Chain.STATEMINE,
    relayChain: Chain.KUSAMA,
    img: 'data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHdpZHRoPSIyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiBmaWxsPSIjMDAwIiByPSIxMDAiLz48ZyBmaWxsPSIjZmZmIj48cGF0aCBkPSJtNTguMTMwNSA3NS41MDkzYy00LjkwMTctMTguMjkzNiA1Ljk1NDQtMzcuMDk3MSAyNC4yNDc5LTQxLjk5ODggNC45MTM0IDE4LjMzNjEgMy45NzM4IDE0LjgyOTggOC44NzU1IDMzLjEyMzQgNC45MDE4IDE4LjI5MzYgMy45NjIyIDE0Ljc4NzMgOC44NzUxIDMzLjEyMzUtMTguMjkzMyA0LjkwMTYtMzcuMDk2Ny01Ljk1NDUtNDEuOTk4NS0yNC4yNDgxeiIvPjxwYXRoIGQ9Im0xNDIuMDA2IDEyNC4yNDhjNC45MDIgMTguMjk0LTUuOTU0IDM3LjA5Ny0yNC4yNDggNDEuOTk5LTQuOTEzLTE4LjMzNi0zLjk3My0xNC44My04Ljg3NS0zMy4xMjQtNC45MDItMTguMjkzLTMuOTYyLTE0Ljc4Ny04Ljg3Ni0zMy4xMjMgMTguMjk0LTQuOTAxOCAzNy4wOTcgNS45NTQgNDEuOTk5IDI0LjI0OHoiLz48cGF0aCBkPSJtNjkuMjI4NiAxNjYuMjA5Yy0xMy4zOTE4LTEzLjM5Mi0xMy4zOTE5LTM1LjEwNC0uMDAwMS00OC40OTYgMTMuNDIzMiAxMy40MjMgMTAuODU2MyAxMC44NTYgMjQuMjQ4MSAyNC4yNDggMTMuMzkxNCAxMy4zOTIgMTAuODI1NCAxMC44MjUgMjQuMjQ4NCAyNC4yNDgtMTMuMzkyIDEzLjM5Mi0zNS4xMDQ1IDEzLjM5Mi00OC40OTY0IDB6Ii8+PHBhdGggZD0ibTEzMC43NTIgMzMuNzUyNGMxMy4zOTIgMTMuMzkxOSAxMy4zOTIgMzUuMTA0MiAwIDQ4LjQ5Ni0xMy40MjMtMTMuNDIyOC0xMC44NTYtMTAuODU2MS0yNC4yNDgtMjQuMjQ4LTEzLjM5MTktMTMuMzkxOC0xMC44MjUtMTAuODI1LTI0LjI0OC0yNC4yNDgxIDEzLjM5MTctMTMuMzkxNyAzNS4xMDQtMTMuMzkxNyA0OC40OTYuMDAwMXoiLz48L2c+PC9zdmc+Cg==',
    parachainId: parachainIds.STATEMINE,
    endpoint: 'wss://statemine-rpc.polkadot.io',
    subscan: 'https://statemine.subscan.io',
    isAstarNativeToken: false,
  },
  [Chain.KARURA]: {
    name: Chain.KARURA,
    relayChain: Chain.KUSAMA,
    img: 'https://assets.coingecko.com/coins/images/17172/small/karura.jpeg?1626782066',
    parachainId: parachainIds.KARURA,
    endpoint: 'wss://karura-rpc.dwellir.com',
    subscan: 'https://karura.subscan.io',
    isAstarNativeToken: true,
  },
  [Chain.ACALA]: {
    name: Chain.ACALA,
    relayChain: Chain.POLKADOT,
    img: 'https://assets.coingecko.com/coins/images/20634/small/upOKBONH_400x400.jpg?1647420536',
    parachainId: parachainIds.ACALA,
    endpoint: 'wss://acala-rpc.dwellir.com',
    subscan: 'https://acala.subscan.io',
    isAstarNativeToken: true,
  },
  [Chain.MOONRIVER]: {
    name: Chain.MOONRIVER,
    relayChain: Chain.KUSAMA,
    img: 'https://assets.coingecko.com/coins/images/17984/small/9285.png?1630028620',
    parachainId: parachainIds.MOONRIVER,
    endpoint: 'wss://wss.api.moonriver.moonbeam.network',
    subscan: 'https://moonriver.subscan.io',
    isAstarNativeToken: true,
  },
  [Chain.MOONBEAM]: {
    name: Chain.MOONBEAM,
    relayChain: Chain.POLKADOT,
    img: 'https://assets.coingecko.com/coins/images/22459/small/glmr.png?1641880985',
    parachainId: parachainIds.MOONBEAM,
    endpoint: 'wss://wss.api.moonbeam.network',
    subscan: 'https://moonbeam.subscan.io',
    isAstarNativeToken: true,
  },
  [Chain.STATEMINT]: {
    name: Chain.STATEMINT,
    relayChain: Chain.POLKADOT,
    img: 'data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHdpZHRoPSIyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiBmaWxsPSIjMDAwIiByPSIxMDAiLz48ZyBmaWxsPSIjZmZmIj48cGF0aCBkPSJtNTguMTMwNSA3NS41MDkzYy00LjkwMTctMTguMjkzNiA1Ljk1NDQtMzcuMDk3MSAyNC4yNDc5LTQxLjk5ODggNC45MTM0IDE4LjMzNjEgMy45NzM4IDE0LjgyOTggOC44NzU1IDMzLjEyMzQgNC45MDE4IDE4LjI5MzYgMy45NjIyIDE0Ljc4NzMgOC44NzUxIDMzLjEyMzUtMTguMjkzMyA0LjkwMTYtMzcuMDk2Ny01Ljk1NDUtNDEuOTk4NS0yNC4yNDgxeiIvPjxwYXRoIGQ9Im0xNDIuMDA2IDEyNC4yNDhjNC45MDIgMTguMjk0LTUuOTU0IDM3LjA5Ny0yNC4yNDggNDEuOTk5LTQuOTEzLTE4LjMzNi0zLjk3My0xNC44My04Ljg3NS0zMy4xMjQtNC45MDItMTguMjkzLTMuOTYyLTE0Ljc4Ny04Ljg3Ni0zMy4xMjMgMTguMjk0LTQuOTAxOCAzNy4wOTcgNS45NTQgNDEuOTk5IDI0LjI0OHoiLz48cGF0aCBkPSJtNjkuMjI4NiAxNjYuMjA5Yy0xMy4zOTE4LTEzLjM5Mi0xMy4zOTE5LTM1LjEwNC0uMDAwMS00OC40OTYgMTMuNDIzMiAxMy40MjMgMTAuODU2MyAxMC44NTYgMjQuMjQ4MSAyNC4yNDggMTMuMzkxNCAxMy4zOTIgMTAuODI1NCAxMC44MjUgMjQuMjQ4NCAyNC4yNDgtMTMuMzkyIDEzLjM5Mi0zNS4xMDQ1IDEzLjM5Mi00OC40OTY0IDB6Ii8+PHBhdGggZD0ibTEzMC43NTIgMzMuNzUyNGMxMy4zOTIgMTMuMzkxOSAxMy4zOTIgMzUuMTA0MiAwIDQ4LjQ5Ni0xMy40MjMtMTMuNDIyOC0xMC44NTYtMTAuODU2MS0yNC4yNDgtMjQuMjQ4LTEzLjM5MTktMTMuMzkxOC0xMC44MjUtMTAuODI1LTI0LjI0OC0yNC4yNDgxIDEzLjM5MTctMTMuMzkxNyAzNS4xMDQtMTMuMzkxNyA0OC40OTYuMDAwMXoiLz48L2c+PC9zdmc+Cg==',
    parachainId: parachainIds.STATEMINT,
    endpoint: 'wss://statemint-rpc.dwellir.com',
    subscan: 'https://statemint.subscan.io',
    isAstarNativeToken: false,
  },
  [Chain.KINTSUGI]: {
    name: Chain.KINTSUGI,
    relayChain: Chain.KUSAMA,
    img: 'https://assets.coingecko.com/coins/images/22045/small/Kintsugi_logo-150x150.jpeg?1640675060',
    parachainId: parachainIds.KINTSUGI,
    endpoint: 'wss://api-kusama.interlay.io/parachain',
    subscan: 'https://kintsugi.subscan.io',
    isAstarNativeToken: false,
  },
  [Chain.INTERLAY]: {
    name: Chain.INTERLAY,
    relayChain: Chain.POLKADOT,
    img: 'https://assets.coingecko.com/coins/images/26180/small/Interlay-Coinbase-2.png?1656382486',
    parachainId: parachainIds.INTERLAY,
    endpoint: 'wss://api.interlay.io/parachain',
    subscan: 'https://interlay.subscan.io',
    isAstarNativeToken: false,
  },
  [Chain.CRUST_SHADOW]: {
    name: Chain.CRUST_SHADOW,
    relayChain: Chain.KUSAMA,
    img: require('/src/assets/img/shadow.svg'),
    parachainId: parachainIds.CRUST_SHADOW,
    endpoint: 'wss://rpc2-shadow.crust.network',
    subscan: 'https://crust.subscan.io',
    isAstarNativeToken: true,
  },
  [Chain.KHALA]: {
    name: Chain.KHALA,
    relayChain: Chain.KUSAMA,
    img: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9ImJsYWNrIi8+CiA8ZyBpZD0iTGF5ZXJfMSI+CiAgPHRpdGxlPkxheWVyIDE8L3RpdGxlPgogIDxnIHRyYW5zZm9ybT0ibWF0cml4KDUuMjExMDEgMCAwIDUuMjExMDEgLTEwNTgwLjYgLTExNzE5LjcpIiBpZD0ic3ZnXzEwMCI+CiAgIDxnIGlkPSJzdmdfNiI+CiAgICA8cmVjdCBpZD0ic3ZnXzEiIGZpbGw9IiMwM0ZGRkYiIGhlaWdodD0iNDkuNTA0IiB3aWR0aD0iMTIuOTI1IiB5PSIyMjczLjQwMTQiIHg9IjIwNTUuNjQ2MzMiLz4KICAgIDxyZWN0IGlkPSJzdmdfMiIgZmlsbD0iIzAzRkZGRiIgaGVpZ2h0PSIxMy4wMjQiIHdpZHRoPSIxMi45MzkiIHk9IjIyODYuOTk4NCIgeD0iMjA2OC40NzMzMyIvPgogICAgPHJlY3QgaWQ9InN2Z18zIiBmaWxsPSIjMDNGRkZGIiBoZWlnaHQ9IjEzLjAyNCIgd2lkdGg9IjEyLjkzOSIgeT0iMjMwMC4wNTE0IiB4PSIyMDgxLjI0MDMzIi8+CiAgICA8cmVjdCBpZD0ic3ZnXzQiIGZpbGw9IiMwM0ZGRkYiIGhlaWdodD0iMTMuMDI0IiB3aWR0aD0iMTIuOTM5IiB5PSIyMzA5LjY2MTQiIHg9IjIwOTAuNTMxMzMiLz4KICAgIDxyZWN0IGlkPSJzdmdfNSIgZmlsbD0iIzAzRkZGRiIgaGVpZ2h0PSIxMy4wMjQiIHdpZHRoPSIyMS44NjMiIHk9IjIyNzMuOTM1NCIgeD0iMjA4MS4wOTQzMyIvPgogICA8L2c+CiAgPC9nPgogPC9nPgo8L3N2Zz4=',
    parachainId: parachainIds.KHALA,
    endpoint: 'wss://khala-api.phala.network/ws',
    subscan: 'https://khala.subscan.io',
    isAstarNativeToken: true,
  },
  [Chain.PHALA]: {
    name: Chain.PHALA,
    relayChain: Chain.POLKADOT,
    img: 'https://assets.coingecko.com/coins/images/12451/small/phala.png?1600061318',
    parachainId: parachainIds.PHALA,
    endpoint: 'wss://api.phala.network/ws',
    subscan: 'https://phala.subscan.io',
    isAstarNativeToken: true,
  },
  [Chain.BIFROST_POLKADOT]: {
    name: Chain.BIFROST_POLKADOT,
    relayChain: Chain.POLKADOT,
    img: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDUwQzAgMjIuMzg1OCAyMi4zODU4IDAgNTAgMFYwQzc3LjYxNDIgMCAxMDAgMjIuMzg1OCAxMDAgNTBWNTBDMTAwIDc3LjYxNDIgNzcuNjE0MiAxMDAgNTAgMTAwVjEwMEMyMi4zODU4IDEwMCAwIDc3LjYxNDIgMCA1MFY1MFoiIGZpbGw9ImJsYWNrIi8+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMCkiPgo8cGF0aCBkPSJNNTAgNzIuMzY4NEgxOS43MzY4TDY1LjEzMTYgMjYuOTczNkg4MC4yNjMxTDUwIDcyLjM2ODRaIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXIpIi8+CjwvZz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhciIgeDE9IjUwIiB5MT0iMjYuOTczNiIgeDI9IjUwIiB5Mj0iNzIuMzY4NCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjN0FFRENGIi8+CjxzdG9wIG9mZnNldD0iMC4yMDEzMzMiIHN0b3AtY29sb3I9IiM2OENFRkEiLz4KPHN0b3Agb2Zmc2V0PSIwLjQwMzI0NCIgc3RvcC1jb2xvcj0iIzY4OUNGOCIvPgo8c3RvcCBvZmZzZXQ9IjAuNjAyMDc2IiBzdG9wLWNvbG9yPSIjQUM1N0MwIi8+CjxzdG9wIG9mZnNldD0iMC44MDE4NjciIHN0b3AtY29sb3I9IiNFNjU2NTkiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjRjJDMjQxIi8+CjwvbGluZWFyR3JhZGllbnQ+CjxjbGlwUGF0aCBpZD0iY2xpcDAiPgo8cmVjdCB3aWR0aD0iNjAuNTI2MyIgaGVpZ2h0PSI0NS4zOTQ3IiBmaWxsPSJ3aGl0ZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTkuNzM2OCAyNi45NzM2KSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=',
    parachainId: parachainIds.BIFROST_POLKADOT,
    endpoint: 'wss://hk.p.bifrost-rpc.liebi.com/ws',
    subscan: 'https://bifrost.subscan.io/',
    isAstarNativeToken: true,
  },
  [Chain.BIFROST_KUSAMA]: {
    name: Chain.BIFROST_KUSAMA,
    relayChain: Chain.KUSAMA,
    img: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDUwQzAgMjIuMzg1OCAyMi4zODU4IDAgNTAgMFYwQzc3LjYxNDIgMCAxMDAgMjIuMzg1OCAxMDAgNTBWNTBDMTAwIDc3LjYxNDIgNzcuNjE0MiAxMDAgNTAgMTAwVjEwMEMyMi4zODU4IDEwMCAwIDc3LjYxNDIgMCA1MFY1MFoiIGZpbGw9ImJsYWNrIi8+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMCkiPgo8cGF0aCBkPSJNNTAgNzIuMzY4NEgxOS43MzY4TDY1LjEzMTYgMjYuOTczNkg4MC4yNjMxTDUwIDcyLjM2ODRaIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXIpIi8+CjwvZz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhciIgeDE9IjUwIiB5MT0iMjYuOTczNiIgeDI9IjUwIiB5Mj0iNzIuMzY4NCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjN0FFRENGIi8+CjxzdG9wIG9mZnNldD0iMC4yMDEzMzMiIHN0b3AtY29sb3I9IiM2OENFRkEiLz4KPHN0b3Agb2Zmc2V0PSIwLjQwMzI0NCIgc3RvcC1jb2xvcj0iIzY4OUNGOCIvPgo8c3RvcCBvZmZzZXQ9IjAuNjAyMDc2IiBzdG9wLWNvbG9yPSIjQUM1N0MwIi8+CjxzdG9wIG9mZnNldD0iMC44MDE4NjciIHN0b3AtY29sb3I9IiNFNjU2NTkiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjRjJDMjQxIi8+CjwvbGluZWFyR3JhZGllbnQ+CjxjbGlwUGF0aCBpZD0iY2xpcDAiPgo8cmVjdCB3aWR0aD0iNjAuNTI2MyIgaGVpZ2h0PSI0NS4zOTQ3IiBmaWxsPSJ3aGl0ZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTkuNzM2OCAyNi45NzM2KSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=',
    parachainId: parachainIds.BIFROST_KUSAMA,
    endpoint: 'wss://bifrost-rpc.liebi.com/ws',
    subscan: 'https://bifrost-kusama.subscan.io/',
    isAstarNativeToken: true,
  },
};

export const xcmChains = objToArray(xcmChainObj);

export const kusamaParachains = xcmChains.filter(
  (it) => it.relayChain === Chain.KUSAMA && it.name !== Chain.KUSAMA
);

export const polkadotParachains = xcmChains.filter(
  (it) => it.relayChain === Chain.POLKADOT && it.name !== Chain.POLKADOT
);
