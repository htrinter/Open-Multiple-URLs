<script lang="ts" setup>
import UrlListInput from '@/browseraction/components/UrlListInput.vue'
import ActionBar from '@/browseraction/components/ActionBar.vue'
import OptionBar from '@/browseraction/components/OptionBar.vue'
import { BrowserStorageKey } from '@/browseraction/components/store/browser-storage'
import browser from 'webextension-polyfill'
import { store } from '@/browseraction/components/store/store'
import { ref } from 'vue'
import { NO_TAB_GROUP_ID, loadTabGroups } from './components/logic/tabgroups'
import { NO_CONTAINER_ID, loadContainers } from './components/logic/containers'

const isStoredValuesLoaded = ref(false)
Promise.all([
  browser.storage.local.get(Object.values(BrowserStorageKey)),
  loadTabGroups(),
  loadContainers()
]).then((data) => {
  // stored options
  store.urlList = String(data[0][BrowserStorageKey.urlList] ?? '')
  store.lazyLoadingChecked = Boolean(data[0][BrowserStorageKey.lazyload]) ?? false
  store.loadInRandomOrderChecked = Boolean(data[0][BrowserStorageKey.random]) ?? false
  store.loadInReverseOrderChecked = Boolean(data[0][BrowserStorageKey.reverse]) ?? false
  store.preserveInputChecked = Boolean(data[0][BrowserStorageKey.preserve]) ?? false
  store.deduplicateURLsChecked = Boolean(data[0][BrowserStorageKey.deduplicate]) ?? false
  store.handleAsSearchQueryChecked =
    Boolean(data[0][BrowserStorageKey.handleAsSearchQuery]) ?? false

  // tab groups (Chrome only)
  store.hasTabGroupSupport = Boolean(browser.tabGroups) ?? false
  store.tabGroups = data[1]
  store.selectedTabGroupId =
    store.tabGroups.find(
      (group) => group.id === Number(data[0][BrowserStorageKey.selectedTabGroupId])
    )?.id ?? NO_TAB_GROUP_ID

  // contextual identities (Firefox only)
  store.hasContainerSupport = Boolean(browser.contextualIdentities) ?? false
  store.containers = data[2]
  store.selectedContainerId =
    store.containers.find((c) => c.cookieStoreId === data[0][BrowserStorageKey.selectedContainerId])
      ?.cookieStoreId ?? NO_CONTAINER_ID

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
