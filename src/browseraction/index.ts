import { extractURLs } from './extract';
import { loadSites, URL_LINE_SPLIT_REGEX } from './load';
import { getStoredOptions, StorageKey, storeValue } from './storage';
import { getUIDef, UIDef } from './ui';

export {};

const saveUrlList = async (ui: UIDef): Promise<void> => {
  if (ui.preserveCheckbox.checked) {
    await storeValue<string>(StorageKey.urlList, ui.txtArea.value);
  }
};

const updateTabCount = (ui: UIDef) => {
  let tabCount = '0';
  if (ui.txtArea.value) {
    const lines = ui.txtArea.value.split(URL_LINE_SPLIT_REGEX);
    if (lines.length <= 5000) {
      // limit for performance reasons
      tabCount = String(lines.filter((line) => line.trim() !== '').length);
    } else {
      tabCount = '> 5000';
    }
  }

  ui.tabCountLabel.innerHTML =
    tabCount === '0'
      ? ''
      : ` <abbr title="Opening too many tabs at once may lead to long wait times or crash your browser.">&#9432; <span>will open ${tabCount} new ${
          tabCount === '1' ? 'tab' : 'tabs'
        }</span></abbr>`;
};

export const init = async (): Promise<void> => {
  const ui = getUIDef();

  // restore options
  const options = await getStoredOptions();
  ui.txtArea.value = options.txt;
  ui.lazyLoadCheckbox.checked = options.lazyload;
  ui.randomCheckbox.checked = options.random;
  ui.preserveCheckbox.checked = options.preserve;

  // add text input events
  ui.txtArea.addEventListener('input', () => {
    saveUrlList(ui);
    updateTabCount(ui);
  });

  // add button events
  ui.openButton.addEventListener('click', () => {
    saveUrlList(ui);
    loadSites(
      ui.txtArea.value,
      ui.lazyLoadCheckbox.checked,
      ui.randomCheckbox.checked
    );
  });
  ui.extractButton.addEventListener('click', () => {
    ui.txtArea.value = extractURLs(ui.txtArea.value);
    saveUrlList(ui);
    updateTabCount(ui);
  });

  // add options events
  ui.lazyLoadCheckbox.addEventListener('change', (event) =>
    storeValue<boolean>(
      StorageKey.lazyload,
      (<HTMLInputElement>event.target).checked
    )
  );
  ui.randomCheckbox.addEventListener('change', (event) =>
    storeValue<boolean>(
      StorageKey.random,
      (<HTMLInputElement>event.target).checked
    )
  );
  ui.preserveCheckbox.addEventListener('change', (event) => {
    const isChecked = (<HTMLInputElement>event.target).checked;
    storeValue<boolean>(StorageKey.preserve, isChecked);
    storeValue<string>(StorageKey.urlList, isChecked ? ui.txtArea.value : '');
  });

  // update tabcount
  updateTabCount(ui);

  // select text in form field
  ui.txtArea.select();
};

document.addEventListener('DOMContentLoaded', init);
