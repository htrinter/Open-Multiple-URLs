# Open Multiple URLs Browser Extension

Browser extension for Chrome and Firefox that opens a list of URLs and additionally extracts URLs from text.

Install the extension via [Chrome Web Store](https://chrome.google.com/webstore/detail/open-multiple-urls/oifijhaokejakekmnjmphonojcfkpbbh) or [Firefox Add-ons](https://addons.mozilla.org/de/firefox/addon/open-multiple-urls/).

## Building the project

The project is written in [TypeScript](https://www.typescriptlang.org/), uses [Parcel](https://parceljs.org/) for bundling, [Jest](https://jestjs.io/) for testing, [ESLint](https://eslint.org/) for linting and [Prettier](https://prettier.io/) for formatting. It requires [Node](https://nodejs.org/en/) Version >= 12 to build.

Due to incompatible manifest.json definitions, there are separate builds for Firefox and Chrome.

First: Install packages via `npm install`.<br>
Then use one of the following build commands:

| Command                 | Description                                                  | Output dir                      |
| :---------------------- | :----------------------------------------------------------- | :------------------------------ |
| `npm run build:firefox` | static production build for Firefox                          | `dist-firefox`                  |
| `npm run build:chrome`  | static production build for Chrome                           | `dist-chrome`                   |
| `npm run dev:firefox`   | live build (watch-mode) for Firefox                          | `dist-dev`                      |
| `npm run dev:chrome`    | live build (watch-mode) for Chrome                           | `dist-dev`                      |
| `npm run build:all`     | format, lint, test and build for production for all browsers | `dist-firefox`<br>`dist-chrome` |

See [instructions for Chrome](https://developer.chrome.com/extensions/getstarted#manifest) and [instructions for Firefox](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/) on how to load an unpacked extension.

Have a look at the `package.json` for all run scripts.

## Features

- Open a list of URLs simultaneously.
- Load and render page on tab focus.
- Extract URLs from text.
- Input text and options saved locally.
- Open tabs in random order.

## Permissions

- "Storage" permission in order to save settings and user input.
