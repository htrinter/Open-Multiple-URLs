import { extractURLs } from './extract';
import { loadSites } from './load';
import { getStoredOptions, StorageKey, storeValue } from './storage';
import { getUIDef } from './ui';

export {};

async function saveUrlList(): Promise<void> {
  const ui = getUIDef();
  if (ui.preserveCheckbox.checked) {
    await storeValue<string>(StorageKey.urlList, ui.txtArea.value);
  }
}

export async function init(): Promise<void> {
  const ui = getUIDef();

  // restore options
  const options = await getStoredOptions();
  ui.txtArea.value = options.txt;
  ui.lazyLoadCheckbox.checked = options.lazyload;
  ui.randomCheckbox.checked = options.random;
  ui.preserveCheckbox.checked = options.preserve;

  // add button events
  ui.openButton.addEventListener('click', () => {
    saveUrlList();
    loadSites(
      ui.txtArea.value,
      ui.lazyLoadCheckbox.checked,
      ui.randomCheckbox.checked
    );
  });
  ui.extractButton.addEventListener('click', () => {
    ui.txtArea.value = extractURLs(ui.txtArea.value);
    saveUrlList();
  });

  // add options events
  ui.txtArea.addEventListener('change', saveUrlList);
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

  // select text in form field
  ui.txtArea.select();
}

document.addEventListener('DOMContentLoaded', init);
