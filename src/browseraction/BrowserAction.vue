<script lang="ts" setup>
import UrlListInput from '@/browseraction/components/UrlListInput.vue'
import ActionBar from '@/browseraction/components/ActionBar.vue'
import OptionBar from '@/browseraction/components/OptionBar.vue'
import { BrowserStorageKey } from '@/browseraction/components/store/browser-storage'
import browser from 'webextension-polyfill'
import { store } from '@/browseraction/components/store/store'
import { ref } from 'vue'

const isStoredValuesLoaded = ref(false)
Promise.all([
  browser.storage.local.get(BrowserStorageKey.urlList),
  browser.storage.local.get(BrowserStorageKey.lazyload),
  browser.storage.local.get(BrowserStorageKey.random),
  browser.storage.local.get(BrowserStorageKey.reverse),
  browser.storage.local.get(BrowserStorageKey.preserve),
  browser.storage.local.get(BrowserStorageKey.deduplicate)
]).then((data) => {
  store.urlList = data[0][BrowserStorageKey.urlList] ?? ''
  store.lazyLoadingChecked = data[1][BrowserStorageKey.lazyload] ?? false
  store.loadInRandomOrderChecked = data[2][BrowserStorageKey.random] ?? false
  store.loadInReverseOrderChecked = data[3][BrowserStorageKey.reverse] ?? false
  store.preserveInputChecked = data[4][BrowserStorageKey.preserve] ?? false
  store.deduplicateURLsChecked = data[5][BrowserStorageKey.deduplicate] ?? false

  isStoredValuesLoaded.value = true
})
</script>

<template>
  <div v-if="isStoredValuesLoaded">
    <UrlListInput />
    <ActionBar />
    <hr />
    <OptionBar />
  </div>
</template>

<style scoped></style>
