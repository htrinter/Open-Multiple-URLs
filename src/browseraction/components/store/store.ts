import { reactive } from 'vue'
import browser from 'webextension-polyfill'
import { BrowserStorageKey } from '@/browseraction/components/store/browser-storage'

export const store = reactive({
  urlList: '',
  lazyLoadingChecked: false,
  loadInRandomOrderChecked: false,
  loadInReverseOrderChecked: false,
  preserveInputChecked: false,
  deduplicateURLsChecked: false,
  setUrlList(value: string) {
    this.urlList = value
    if (store.preserveInputChecked) {
      browser.storage.local.set({ [BrowserStorageKey.urlList]: value })
    }
  },
  setLazyLoadingChecked(value: boolean) {
    this.lazyLoadingChecked = value
    browser.storage.local.set({ [BrowserStorageKey.lazyload]: value })
  },
  setLoadInRandomOrderChecked(value: boolean) {
    this.loadInRandomOrderChecked = value
    browser.storage.local.set({ [BrowserStorageKey.random]: value })
  },
  setLoadInReverseOrderChecked(value: boolean) {
    this.loadInReverseOrderChecked = value
    browser.storage.local.set({ [BrowserStorageKey.reverse]: value })
  },
  setPreserveInputChecked(value: boolean) {
    this.preserveInputChecked = value
    browser.storage.local.set({ [BrowserStorageKey.preserve]: value })
    browser.storage.local.set({ [BrowserStorageKey.urlList]: value ? store.urlList : '' })
  },
  setDeduplicateURLsChecked(value: boolean) {
    this.deduplicateURLsChecked = value
    browser.storage.local.set({ [BrowserStorageKey.deduplicate]: value })
  }
})
