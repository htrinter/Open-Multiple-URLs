# Open Multiple URLs Browser Extension

Browser extension for Chrome and Firefox that opens a list of URLs and additionally extracts URLs from text.

Install the extension via [Chrome Web Store](https://chrome.google.com/webstore/detail/open-multiple-urls/oifijhaokejakekmnjmphonojcfkpbbh) or [Firefox Add-ons](https://addons.mozilla.org/de/firefox/addon/open-multiple-urls/).

## Building the project

The project is written in [TypeScript](https://www.typescriptlang.org/), uses [Parcel](https://parceljs.org/) for bundling, [Jest](https://jestjs.io/) for testing, [ESLint](https://eslint.org/) for linting and [Prettier](https://prettier.io/) for formatting. It requires [Node](https://nodejs.org/en/) Version >= 12 to build.

Build the project to `dist` by executing

    npm install
    npm run build

Format, lint, execute tests and then build via

    npm run build-run-all

Start in watch mode via

    npm run dev

You can load the extension from directory `dist` after building. If you start in watch mode you can load the extension from directory `dev-out` for local development. See [instructions for Chrome](https://developer.chrome.com/extensions/getstarted#manifest) and [instructions for Firefox](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/) on how to load an unpacked extension.

Have a look at the `package.json` for all run scripts.

## Features

- Open a list of URLs simultaneously.
- Load and render page on tab focus.
- Extract URLs from text.
- Input text and options saved locally.
- Open tabs in random order.

## Permissions

This extension requires the "Tabs" permission in order to open new tabs. The permission appears as "Access your browsing activity" because URLs of tabs are accessible, although this access is only used to set the URL of tabs opened by the extension.
