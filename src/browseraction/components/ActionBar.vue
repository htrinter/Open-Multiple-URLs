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
    <span
      id="tabcount"
      v-if="tabCount >= 25"
      aria-label="Opening many tabs at once may lead to long wait times or crash your browser."
      data-microtip-position="bottom"
      data-microtip-size="medium"
      role="tooltip"
    >
      &#9888;
    </span>
  </section>
</template>

<script lang="ts">
import { getTabCount, loadSites } from '@/browseraction/components/logic/load'
import { extractURLs } from '@/browseraction/components/logic/extract'
import { store } from '@/browseraction/components/store/store'
import { loadTabGroups } from './logic/tabgroups'

export default {
  data() {
    return {
      selectedTabGroupId: store.selectedTabGroupId
    }
  },
  methods: {
    openURLs() {
      loadSites(
        store.urlList,
        store.lazyLoadingChecked,
        store.loadInRandomOrderChecked,
        store.loadInReverseOrderChecked,
        store.deduplicateURLsChecked,
        this.selectedTabGroupId
      ).then(() => {
        loadTabGroups().then((tabGroups) => {
          store.tabGroups = tabGroups
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
    }
  }
}
</script>

<style scoped></style>
