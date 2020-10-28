import { browser } from 'webextension-polyfill-ts';

export enum StorageKey {
  urlList = 'txt',
  lazyload = 'lazyload',
  random = 'random',
  preserve = 'preserve',
}

export interface StoredOptions {
  [StorageKey.urlList]: string;
  [StorageKey.lazyload]: boolean;
  [StorageKey.random]: boolean;
  [StorageKey.preserve]: boolean;
}

export async function getStoredOptions(): Promise<StoredOptions> {
  const txtVal = await browser.storage.local.get(StorageKey.urlList);
  const lazyloadVal = await browser.storage.local.get(StorageKey.lazyload);
  const randomVal = await browser.storage.local.get(StorageKey.random);
  const preserveVal = await browser.storage.local.get(StorageKey.preserve);

  return {
    txt: txtVal ? txtVal.txt || '' : '',
    lazyload: lazyloadVal ? lazyloadVal.lazyload || false : false,
    random: randomVal ? randomVal.random || false : false,
    preserve:
      txtVal && txtVal.txt
        ? true
        : preserveVal
        ? preserveVal.preserve || false
        : false,
  };
}

export function storeValue<T>(key: StorageKey, value: T): void {
  browser.storage.local.set({ [key]: value });
}
