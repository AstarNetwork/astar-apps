# Astar Portal (astar-portal)

Astar Portal App

## Install the dependencies
```bash
yarn
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
```

### Build the app for production
```bash
quasar build
```

### Customize the configuration
See [Configuring quasar.conf.js](https://v2.quasar.dev/quasar-cli/quasar-conf-js).

### Translation

This project is using [vue-i18n](https://kazupon.github.io/vue-i18n/) to handle localization.
Please refer to `src/i18n/files/LANGUAGE.ts` file to add or edit sentences.

### How To Contribute

When you push your branch to remote ones, please run `yarn lint` to comply to the code convention.

When you add a new library, please make sure it license is not
[GPL](https://en.wikipedia.org/wiki/GNU_General_Public_License). And please use `-D` for @types.