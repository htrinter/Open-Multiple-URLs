<template>
  <section id="action-bar">
    <button id="extract" tabindex="6" @click="setUrlListInputData">Extract URLs from text</button>
    <button id="open" tabindex="2" @click="openURLs">
      <strong>
        Open URLs <span v-if="tabCount > 0">({{ tabCount }})</span>
      </strong>
    </button>
    <select
      id="tabGroupSelection"
      v-if="tabGroupsSupported"
      v-model="selectedTabGroupId"
      @change="setTabGroupSelection"
    >
      <option v-for="group in tabGroups" :key="group.id" :value="group.id">
        {{ group.title }}
      </option>
    </select>
    <select
      id="containerSelection"
      v-if="containersSupported"
      v-model="selectedContainerId"
      @change="setContainerSelection"
    >
      <option v-for="c in containers" :key="c.cookieStoreId" :value="c.cookieStoreId">
        {{ c.title }}
      </option>
    </select>
    <span
      id="tabcount"
      v-if="tabCount >= 25"
      aria-label="Opening many URLs at once may lead to long wait times or crash your browser."
      data-microtip-position="bottom"
      data-microtip-size="medium"
      role="tooltip"
    >
      &#9888;
    </span>
  </section>
</template>

<script lang="ts">
import { extractURLs } from '@/browseraction/components/logic/extract'
import { store } from '@/browseraction/components/store/store'
import { loadTabGroups } from './logic/tabgroups'
import { loadContainers } from './logic/containers'
import browser from 'webextension-polyfill'
import type { LoadSitesMessage } from '@/serviceworker/types'
import { getTabCount } from './logic/load'

export default {
  data() {
    return {
      selectedTabGroupId: store.selectedTabGroupId,
      selectedContainerId: store.selectedContainerId
    }
  },
  methods: {
    openURLs() {
      const message: LoadSitesMessage = {
        action: 'loadSites',
        text: store.urlList,
        lazyloading: store.lazyLoadingChecked,
        random: store.loadInRandomOrderChecked,
        reverse: store.loadInReverseOrderChecked,
        deduplicate: store.deduplicateURLsChecked,
        handleAsSearchQuery: store.handleAsSearchQueryChecked,
        selectedTabGroupId: this.selectedTabGroupId,
        selectedContainerId: this.selectedContainerId
      }
      browser.runtime.sendMessage(message).then(() => {
        loadTabGroups().then((tabGroups) => {
          store.tabGroups = tabGroups
        })
        loadContainers().then((containers) => {
          store.containers = containers
        })
      })
    },
    setUrlListInputData() {
      store.setUrlList(extractURLs(store.urlList))
    },
    setTabGroupSelection() {
      this.$nextTick(() => {
        store.setSelectedTabGroupId(this.selectedTabGroupId)
      })
    },
    setContainerSelection() {
      this.$nextTick(() => {
        store.setSelectedContainerId(this.selectedContainerId)
      })
    }
  },
  computed: {
    tabCount: function () {
      return getTabCount(store.urlList, store.deduplicateURLsChecked)
    },
    tabGroupsSupported: function () {
      return store.hasTabGroupSupport
    },
    tabGroups: function () {
      return store.tabGroups
    },
    containersSupported: function () {
      return store.hasContainerSupport
    },
    containers: function () {
      return store.containers
    }
  }
}
</script>

<style scoped></style>
