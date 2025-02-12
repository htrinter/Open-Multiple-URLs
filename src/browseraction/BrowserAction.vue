<script lang="ts" setup>
import UrlListInput from '@/browseraction/components/UrlListInput.vue'
import ActionBar from '@/browseraction/components/ActionBar.vue'
import OptionBar from '@/browseraction/components/OptionBar.vue'
import { BrowserStorageKey } from '@/browseraction/components/store/browser-storage'
import browser from 'webextension-polyfill'
import { store } from '@/browseraction/components/store/store'
import { ref } from 'vue'
import { NEW_TAB_GROUP_ID, NO_TAB_GROUP_ID } from './components/logic/load'

const isStoredValuesLoaded = ref(false)
Promise.all([
  browser.storage.local.get(BrowserStorageKey.urlList),
  browser.storage.local.get(BrowserStorageKey.lazyload),
  browser.storage.local.get(BrowserStorageKey.random),
  browser.storage.local.get(BrowserStorageKey.reverse),
  browser.storage.local.get(BrowserStorageKey.preserve),
  browser.storage.local.get(BrowserStorageKey.deduplicate),
  browser.tabGroups?.query({}) || Promise.resolve([]),
  browser.storage.local.get(BrowserStorageKey.selectedTabGroupId)
]).then((data) => {
  store.urlList = String(data[0][BrowserStorageKey.urlList] ?? "")
  store.lazyLoadingChecked = Boolean(data[1][BrowserStorageKey.lazyload]) ?? false
  store.loadInRandomOrderChecked = Boolean(data[2][BrowserStorageKey.random]) ?? false
  store.loadInReverseOrderChecked = Boolean(data[3][BrowserStorageKey.reverse]) ?? false
  store.preserveInputChecked = Boolean(data[4][BrowserStorageKey.preserve]) ?? false
  store.deduplicateURLsChecked = Boolean(data[5][BrowserStorageKey.deduplicate]) ?? false
  store.hasTabGroupSupport = Boolean(browser.tabGroups) ?? false
  store.tabGroups = [
    { id: NO_TAB_GROUP_ID, title: "No Tab Group" },
    { id: NEW_TAB_GROUP_ID, title: "New Tab Group" },
    ...data[6].map((group) => ({ id: group.id, title: `${group.title}${group.title ? " " : ""}(${group.color})`}))
  ]
  store.selectedTabGroupId = store.tabGroups.find((group) => group.id === Number(data[7][BrowserStorageKey.selectedTabGroupId]))?.id ?? NO_TAB_GROUP_ID

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
