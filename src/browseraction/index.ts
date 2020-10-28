import { extractURLs } from './extract';
import { loadSites } from './load';
import { getStoredOptions, StorageKey, storeValue } from './storage';
import { getUIDef } from './ui';

export {};

document.addEventListener('DOMContentLoaded', init);

export async function init(): Promise<void> {
  // get ui
  const ui = getUIDef();

  // restore options
  const options = await getStoredOptions();
  ui.txtArea.value = options.txt;
  ui.lazyLoadCheckbox.checked = options.lazyload;
  ui.randomCheckbox.checked = options.random;
  ui.preserveCheckbox.checked = options.preserve;

  // add button events
  ui.openButton.addEventListener('click', () => {
    loadSites(
      ui.txtArea.value,
      ui.lazyLoadCheckbox.checked,
      ui.randomCheckbox.checked
    );
  });
  ui.extractButton.addEventListener('click', () => {
    ui.txtArea.value = extractURLs(ui.txtArea.value);
  });

  // add options events
  ui.txtArea.addEventListener('change', (event) => {
    if (ui.preserveCheckbox.checked) {
      storeValue<string>(
        StorageKey.urlList,
        (<HTMLInputElement>event.target).value
      );
    }
  });
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
