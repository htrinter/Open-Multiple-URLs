# Open Multiple URLs Chrome Extension

A Chrome extension that opens a list of URLs and optionally extracts URLs from text.

## Features

- Open multiple URLs simultaneously.
- Load and render page on tab focus.
- Extract URLs from text.
- Input text and options cached locally.
- Open tabs in random order.

## Usage

**Option 1: [Get this extension from the Chrome Web Store](https://chrome.google.com/webstore/detail/open-multiple-urls/oifijhaokejakekmnjmphonojcfkpbbh?hl=de)**

**Option 2: Load from source code**

1. Clone this repo.
2. Visit [chrome://extensions](chrome://extensions) (via Omnibox or Menu -> Tools -> Extensions).
    - Enable Developer mode by ticking the checkbox in the upper-right corner.
    - Click on the "Load unpacked" button.
    - Select the directory containing the unpacked extension.

## Permissions

This extension requires the "Tabs" permission in order to open new tabs. The permission appears as "Access your browsing activity" because URLs of tabs are accessible, although this access is only used to set the URL of tabs opened by the extension.
