![astar-cover](https://user-images.githubusercontent.com/40356749/135799652-175e0d24-1255-4c26-87e8-447b192fd4b2.gif)

<div align="center">

[![License](https://img.shields.io/github/license/AstarNetwork/astar-apps?color=green)](https://github.com/AstarNetwork/astar-apps/blob/main/LICENSE)
<br />
[![Twitter URL](https://img.shields.io/twitter/follow/AstarNetwork?style=social)](https://twitter.com/AstarNetwork)
[![Twitter URL](https://img.shields.io/twitter/follow/ShidenNetwork?style=social)](https://twitter.com/ShidenNetwork)
[![YouTube](https://img.shields.io/youtube/channel/subscribers/UC36JgEF6gqatVSK9xlzzrvQ?style=social)](https://www.youtube.com/channel/UC36JgEF6gqatVSK9xlzzrvQ)
[![Discord](https://img.shields.io/badge/Discord-gray?logo=discord)](https://discord.gg/astarnetwork)
[![Telegram](https://img.shields.io/badge/Telegram-gray?logo=telegram)](https://t.me/PlasmOfficial)
[![Medium](https://img.shields.io/badge/Medium-gray?logo=medium)](https://medium.com/astar-network)

</div>

# Astar Portal

Astar Portal App - the application for using everything that Astar Network offers.
This project is made with Vue 3 + TypeScript + Quasar.

## Usage

Ensure that you have [Yarn](https://yarnpkg.com/getting-started/install) and Node.js 18.x.

```bash
# install the dependencies
yarn

# run the local dev page
yarn dev

# build the project
yarn build
```

## E2E Testing

For E2E testing, we utilize [chopsticks](https://github.com/AcalaNetwork/chopsticks) and [playwright](https://playwright.dev/) to mandatorily write test cases that test all of business logic.

### Setup chopsticks

```bash
npx @acala-network/chopsticks@latest xcm -p=tests/chopsticks/astar.yml -p=tests/chopsticks/acala.yml -r=tests/chopsticks/polkadot.yml
```

### Running tests locally in debug mode

- Start the portal (the portal should run on http://localhost:8080)

- You need to be familiar with Playwright generator by running codegen

```bash
yarn playwright:codegen
```

- Run the following

```bash
yarn playwright
```

- debug each file individually

```bash
yarn playwright tests/dappstaking-transactions.spec.ts
```

### Running test in CI mode

- Start the portal (the portal should run on http://localhost:8080)

- Run the following

```bash
BASE_URL='http://localhost:8080' yarn playwright:ci
```

### Write test cases

- Create test file or added test cases on existing file in /tests
  - Simple UI e2e testing : (assets).spec.ts
  - Native Transaction e2e testing : (assets)-transactions.spec.ts
  - EVM Transaction e2e testing : (assets)-transactions-evm.spec.ts
