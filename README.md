# Open Multiple URLs Browser Extension

[![test status](https://github.com/htrinter/Open-Multiple-URLs/actions/workflows/test-action.yml/badge.svg)](https://github.com/htrinter/Open-Multiple-URLs/actions/workflows/test-action.yml)

Browser extension for Chrome and Firefox that opens a list of URLs and additionally extracts URLs from text.

Install the extension via [Chrome Web Store](https://chrome.google.com/webstore/detail/open-multiple-urls/oifijhaokejakekmnjmphonojcfkpbbh) or [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/open-multiple-urls/).

## Usage

There should be an icon in the browser's toolbar. Chrome hides extension icons by default, so you have to "pin" it to the toolbar. Click the "Extensions" button in the toolbar to do that. Then click on the extension's icon, enter URLs and click the "open" button.

## Building the project

The project is written in [Vue.js](https://vuejs.org/) using [TypeScript](https://www.typescriptlang.org/), utilizes [Vite](https://vitejs.dev/) for bundling, [Vitest](https://vitest.dev/) for testing, [ESLint](https://eslint.org/) for linting and [Prettier](https://prettier.io/) for formatting. It requires [Node](https://nodejs.org/en/) Version >= 18 to build.

Due to incompatible manifest.json definitions, there are separate builds for Firefox and Chrome.

First: Install packages via `npm install`.<br>
Then use one of the following build commands:

| Command                   | Description                         | Output dir                      |
|:--------------------------|:------------------------------------|:--------------------------------|
| `npm run dev:firefox`     | live build (watch-mode) for Firefox | `dist-firefox`                  |
| `npm run dev:chrome`      | live build (watch-mode) for Chrome  | `dist-chrome`                   |
| `npm run build:firefox`   | production build for Firefox        | `dist-firefox`                  |
| `npm run build:chrome`    | production build for Chrome         | `dist-chrome`                   |
| `npm run build:all`       | production build for all browsers   | `dist-firefox`<br>`dist-chrome` |
| `npm run package:firefox` | package for Firefox       | `dist-package`                      |
| `npm run package:chrome`      | package for Chrome                         | `dist-package`                      |
| `npm run package:all`         | package for all browsers   | `dist-package`     |

See [instructions for Chrome](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked) and [instructions for Firefox](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/) on how to load an unpacked extension.

Have a look at the `package.json` for all run scripts.

## Features

- Open a list of URLs simultaneously.
- Load and render page on tab focus.
- Extract URLs from text.
- Input text and options saved locally.
- Open tabs in random order.

## Permissions

- "Storage" permission in order to save settings and user input.
