<template>
  <section id="action-bar">
    <button id="extract" tabindex="6" @click="setUrlListInputData">Extract URLs from text</button>
    <button id="open" tabindex="2" @click="openURLs">
      <strong>Open URLs</strong>
    </button>
    <span id="tabcount" v-if="tabCount !== '0'">
      <abbr
        title="Opening too many tabs at once may lead to long wait times or crash your browser."
      >
        &#9432;
        <span>
          will open
          <span id="tabcount-number">{{ tabCount }}</span>
          new
          <span id="tabcount-tab-label">tab<span v-if="tabCount !== '1'">s</span></span>
        </span>
      </abbr>
    </span>
  </section>
</template>

<script lang="ts">
import { getTabCount, loadSites } from '@/browseraction/components/logic/load'
import { extractURLs } from '@/browseraction/components/logic/extract'
import { store } from '@/browseraction/components/store/store'

export default {
  methods: {
    openURLs() {
      loadSites(
        store.urlList,
        store.lazyLoadingChecked,
        store.loadInRandomOrderChecked,
        store.loadInReverseOrderChecked,
        store.deduplicateURLsChecked
      )
    },
    setUrlListInputData() {
      store.urlList = extractURLs(store.urlList)
    }
  },
  computed: {
    tabCount: function () {
      return getTabCount(store.urlList, store.deduplicateURLsChecked)
    }
  }
}
</script>

<style scoped></style>
