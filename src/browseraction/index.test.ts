import {
  init,
  SAVE_URL_LIST_DEBOUNCE_TIME_MS,
  UPDATE_TAB_COUNT_DEBOUNCE_TIME_MS,
} from '.';
import { extractURLs } from './extract';
import { loadSites } from './load';
import { getStoredOptions, StorageKey, storeValue } from './storage';
import { getUIDef } from './ui';
import * as fs from 'fs';

const BODY_HTML = fs.readFileSync('./src/browseraction.html', 'utf-8');

let mockStore = {};
jest.mock('./load', () => ({
  ...jest.requireActual('./load'),
  loadSites: jest.fn(),
}));
jest.mock('./extract');
jest.mock('webextension-polyfill-ts', () => ({
  browser: {
    tabs: { create: jest.fn() },
    extension: { getURL: (val: string) => val },
    storage: {
      local: {
        get: (key: string) => {
          return { [key]: mockStore[key] };
        },
        set: (val: any) => (mockStore = { ...mockStore, ...val }), // eslint-disable-line @typescript-eslint/no-explicit-any
      },
    },
  },
}));

const sleep = async (timeInMs: number) => {
  await new Promise((r) => setTimeout(r, timeInMs));
};

describe('test browser action', () => {
  beforeEach(async () => {
    mockStore = {};
    document.body.innerHTML = BODY_HTML;
  });

  test('init and render elements', async () => {
    await init();

    const uiDef = getUIDef();
    expect(uiDef.txtArea).toBeTruthy();
    expect(uiDef.lazyLoadCheckbox).toBeTruthy();
    expect(uiDef.randomCheckbox).toBeTruthy();
    expect(uiDef.preserveCheckbox).toBeTruthy();
    expect(uiDef.openButton).toBeTruthy();
    expect(uiDef.extractButton).toBeTruthy();
  });

  test('set default options', async () => {
    await init();

    const uiDef = getUIDef();
    expect(uiDef.txtArea.value).toBe('');
    expect(uiDef.lazyLoadCheckbox.checked).toBe(false);
    expect(uiDef.randomCheckbox.checked).toBe(false);
    expect(uiDef.preserveCheckbox.checked).toBe(false);
  });

  test('restore options', async () => {
    await init();

    let uiDef = getUIDef();
    uiDef.txtArea.value = 'foobar';
    uiDef.txtArea.dispatchEvent(new Event('input'));
    uiDef.lazyLoadCheckbox.click();
    uiDef.randomCheckbox.click();
    uiDef.preserveCheckbox.click();

    uiDef = getUIDef();
    expect(uiDef.txtArea.value).toBe('foobar');
    expect(uiDef.lazyLoadCheckbox.checked).toBe(true);
    expect(uiDef.randomCheckbox.checked).toBe(true);
    expect(uiDef.preserveCheckbox.checked).toBe(true);

    document.body.innerHTML = BODY_HTML;

    uiDef = getUIDef();
    expect(uiDef.txtArea.value).toBe('');
    expect(uiDef.lazyLoadCheckbox.checked).toBe(false);
    expect(uiDef.randomCheckbox.checked).toBe(false);
    expect(uiDef.preserveCheckbox.checked).toBe(false);

    await init();

    uiDef = getUIDef();
    expect(uiDef.txtArea.value).toBe('foobar');
    expect(uiDef.lazyLoadCheckbox.checked).toBe(true);
    expect(uiDef.randomCheckbox.checked).toBe(true);
    expect(uiDef.preserveCheckbox.checked).toBe(true);
  });

  test('set preserve checked if text exists in storage', async () => {
    storeValue(StorageKey.urlList, 'https://test.de');

    await init();

    const uiDef = getUIDef();
    expect(uiDef.txtArea.value).toBe('https://test.de');
    expect(uiDef.lazyLoadCheckbox.checked).toBe(false);
    expect(uiDef.randomCheckbox.checked).toBe(false);
    expect(uiDef.preserveCheckbox.checked).toBe(true);
  });

  test('store url list depending on option state', async () => {
    await init();

    const uiDef = getUIDef();

    uiDef.txtArea.value = 'foobar';
    uiDef.txtArea.dispatchEvent(new Event('input'));
    expect((await getStoredOptions()).txt).toBe('');

    uiDef.preserveCheckbox.click();
    expect((await getStoredOptions()).txt).toBe('foobar');

    uiDef.txtArea.value = 'boofar';
    uiDef.txtArea.dispatchEvent(new Event('input'));
    expect((await getStoredOptions()).txt).toBe('foobar');
    await sleep(SAVE_URL_LIST_DEBOUNCE_TIME_MS);
    expect((await getStoredOptions()).txt).toBe('boofar');

    uiDef.preserveCheckbox.click();
    expect((await getStoredOptions()).txt).toBe('');
  });

  test('store option status', async () => {
    await init();

    const uiDef = getUIDef();

    let options = await getStoredOptions();
    expect(options.txt).toBe('');
    expect(options.lazyload).toBe(false);
    expect(options.random).toBe(false);
    expect(options.preserve).toBe(false);

    uiDef.lazyLoadCheckbox.click();
    uiDef.randomCheckbox.click();
    uiDef.preserveCheckbox.click();

    options = await getStoredOptions();
    expect(options.txt).toBe('');
    expect(options.lazyload).toBe(true);
    expect(options.random).toBe(true);
    expect(options.preserve).toBe(true);

    uiDef.lazyLoadCheckbox.click();
    uiDef.randomCheckbox.click();
    uiDef.preserveCheckbox.click();

    options = await getStoredOptions();
    expect(options.txt).toBe('');
    expect(options.lazyload).toBe(false);
    expect(options.random).toBe(false);
    expect(options.preserve).toBe(false);
  });

  test('call open on button click', async () => {
    await init();

    const uiDef = getUIDef();
    uiDef.openButton.click();

    expect(loadSites).toHaveBeenCalled();
  });

  test('call extract on button click', async () => {
    await init();

    const uiDef = getUIDef();
    uiDef.extractButton.click();

    expect(extractURLs).toHaveBeenCalled();
  });

  test('display tab count', async () => {
    const uiDef = getUIDef();
    const hasNoTabCount = () => {
      return uiDef.tabCount.style.visibility === 'hidden';
    };
    const hasTabCount = (tabNo: string) => {
      return (
        uiDef.tabCount.style.visibility === 'visible' &&
        uiDef.tabCount.textContent
          .replace(/\s+/g, ' ')
          .indexOf(
            `will open ${tabNo} new ${tabNo === '1' ? 'tab' : 'tabs'}`
          ) !== -1
      );
    };

    await init();

    expect(hasNoTabCount()).toBeTruthy();

    uiDef.txtArea.value = 'https://test.de';
    uiDef.txtArea.dispatchEvent(new Event('input'));
    expect(hasNoTabCount()).toBeTruthy();
    await sleep(UPDATE_TAB_COUNT_DEBOUNCE_TIME_MS);
    expect(hasTabCount('1')).toBeTruthy();

    uiDef.txtArea.value = 'https://test.de\nhttps://spiegel.de';
    uiDef.txtArea.dispatchEvent(new Event('input'));
    expect(hasTabCount('1')).toBeTruthy();
    await sleep(UPDATE_TAB_COUNT_DEBOUNCE_TIME_MS);
    expect(hasTabCount('2')).toBeTruthy();

    uiDef.txtArea.value =
      'https://test.de\n\nhttps://spiegel.de\n    \nhttps://zeit.de\n\n   \n ';
    uiDef.txtArea.dispatchEvent(new Event('input'));
    expect(hasTabCount('2')).toBeTruthy();
    await sleep(UPDATE_TAB_COUNT_DEBOUNCE_TIME_MS);
    expect(hasTabCount('3')).toBeTruthy();

    uiDef.txtArea.value = 'https://test.de\n'.repeat(5001);
    uiDef.txtArea.dispatchEvent(new Event('input'));
    expect(hasTabCount('3')).toBeTruthy();
    await sleep(UPDATE_TAB_COUNT_DEBOUNCE_TIME_MS);
    expect(hasTabCount('> 5000')).toBeTruthy();
  });
});
