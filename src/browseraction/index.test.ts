import { init } from '.';
import { extractURLs } from './extract';
import { loadSites } from './load';
import { getStoredOptions, StorageKey, storeValue } from './storage';
import { getUIDef } from './ui';

const BODY_HTML =
  '<main><section> <label for="urls">List of URLs / Text to extract URLs from:</label> <textarea id="urls" wrap="soft" tabindex="1"></textarea> </section> <section> <button id="extract" tabindex="6">Extract URLs from text</button> <button id="open" tabindex="2">Open URLs</button><span id="tabcount"></span></section> <section> <label class="checkbox" ><input type="checkbox" id="lazyLoad" tabindex="3"/> Do not load tabs until selected</label > <label class="checkbox" ><input type="checkbox" id="random" tabindex="4"/> Load in random order</label > </section> <section> <label class="checkbox" ><input type="checkbox" id="preserve" tabindex="5"/> Preserve input</label > </section> </main>';

let mockStore = {};
jest.mock('./load');
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
});
