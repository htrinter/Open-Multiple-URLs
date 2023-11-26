# Changelog

## 2.0.0

- Added
  - Option to ignore duplicate URLs on open
- Changed
  - Complete rewrite in Vue.js

## 1.5.6

- Fixed
  - Fix regression in Chrome: No shortcut for popup activation, caused by migration to manifest v3

## 1.5.5

- Added
  - Option to open tabs in reverse order
- Changed
  - Chrome: Update manifest version

## 1.5.4

- Changed
  - Remove unsafe assignment of innerHTML

## 1.5.3

- Added
  - Indicator for amount of tabs to be opened
- Changed
  - Refreshed design with improved element sizes, margins and paddings
  - Lazy loading: Use replace instead of assign for URL navigation, in order to avoid unnecessary history entries

## 1.5.2

- Changed
  - Remove unnecessary "tabs" permission

## v1.5.1

- Changed
  - Enable split mode for Chrome, in order to fully support incognito mode
  - Upgrade some dependencies
- Fixed
  - Fix issues with unsaved changes on extract

## v1.5

- Changed
  - Migrate to TypeScript
  - Make "preserve input" feature an option
  - Improve spacing of UI elements

## 1.4.3

- Added
  - Add abstraction of browser API object to make extension work with both Chromium and Firefox API
- Changed
  - Migrate to new storage API
- Fixed
  - Fix save of selected lazy loading and random option

## 1.4.2

- Changed
  - Migrate to ECMAScript 6
  - Replace deprecated property 'selected' of 'tabs.create' API with 'active'
- Fixed
  - Fix line wrap in Firefox

## v1.4.1

- Fixed
  - Fixed problem where text was not stored after use of the URL extraction feature

## v1.4

- Added
  - Text and selected options are stored
  - Option to open tabs in random order
- Changed
  - Select text in form field instead of focus on field

## v1.3.2

- Added
  - Support for additional URL schemes

## v1.3.1

- Changed:
  - Display URL in title of lazy-loading tabs

## v1.3

- Added:
  - Option to extract URLs from text

## v1.2.1

- Added:
  - Auto-focus on form field

## v1.2

- Added
  - Option to lazy-load tabs

## v1.1.1

- Fixed:
  - Handling of URLs beginning with 'https://'

## v1.1

- Added:
  - Ignore blank lines in URL list
  - Add 'http://' to URLs if not present

## v1.0

- Initial release
