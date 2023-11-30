<template>
  <section id="action-bar">
    <button id="extract" tabindex="6" @click="invokeExtractURLs">Extract URLs from text</button>
    <button id="clipper" tabindex="6" @click="invokePageClipper">Clip links from page</button>
    <button id="open" tabindex="2" @click="invokeOpenURLs">
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
  <section id="permissions-notification" v-if="showPermissionsNotification">
    <div>
      The page clipper works by enabling you to select areas of a web page to extract links from. To do this, the extension
      requires permission to access page contents of <span class="url">{{ currentPermissionTabHost }}</span>.
    </div>
    <div>
      <button id="grant-permissions" @click="requestPageClipperPermissions()">
        <strong>Grant permission</strong>
      </button>
      <button id="cancel-grant-permissions" @click="cancelRequestPageClipperPermissions">
        Cancel
      </button>
    </div>
    <div>
      <label class="checkbox"
      ><input
          type="checkbox"
      />
        Do not show this explanation again</label
      >
    </div>
  </section>
</template>

<script lang="ts">
import { getTabCount, loadSites } from '@/browseraction/components/logic/load'
import { extractURLs } from '@/browseraction/components/logic/extract'
import { store } from '@/browseraction/components/store/store'
import browser from 'webextension-polyfill'
import { version } from '../../../package.json'

const NO_CLIP_MESSAGE = 'Clipping is not possible on this page.'

export default {
  data() {
    return {
      showPermissionsNotification: false,
      currentPermissionTabUrl: '',
      currentPermissionTabHost: '',
      currentPermissionsTabId: 0
    }
  },
  methods: {
    invokeOpenURLs() {
      loadSites(
        store.urlList,
        store.lazyLoadingChecked,
        store.loadInRandomOrderChecked,
        store.loadInReverseOrderChecked,
        store.deduplicateURLsChecked
      )
    },
    invokeExtractURLs() {
      store.setUrlList(extractURLs(store.urlList))
    },
    async invokePageClipper() {
      const { tabId, tabUrl } = await this.getCurrentTabInfo()
      if (tabId === undefined || tabUrl === undefined) {
        alert(NO_CLIP_MESSAGE)
        return
      }

      this.currentPermissionTabUrl = tabUrl
      this.currentPermissionTabHost = new URL(tabUrl).host
      this.currentPermissionsTabId = tabId

      let hasPermissions = false
      try {
        hasPermissions = await browser.permissions.contains(
            this.buildClipperPermissionsObject()
        )
      } catch (e) {
        console.error(e)
        alert(NO_CLIP_MESSAGE)
        return
      }
      if (hasPermissions) {
        await this.injectClipperScript()
      } else {
        this.showPermissionsNotification = true
      }
    },
    async getCurrentTabInfo(): Promise<{ tabId: number | undefined; tabUrl: string | undefined }> {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true })
      return { tabId: tabs[0].id, tabUrl: tabs[0].url }
    },
    buildClipperPermissionsObject(): browser.Permissions.Permissions {
      return {
        permissions: ['scripting'],
        origins: [this.currentPermissionTabUrl]
      }
    },
    async injectClipperScript() {
      try {
        const executeResponse = await browser.scripting.executeScript({
          target: { tabId: this.currentPermissionsTabId, allFrames: true },
          files: [`assets/ClipperContentScript-${version}.js`]
        })

        if (!executeResponse || executeResponse.filter((r) => !r).length) {
          alert(NO_CLIP_MESSAGE)
        } else {
          window.close()
        }
      } catch (e) {
        console.error(e)
        alert((e as Error).message)
      }
    },
    async requestPageClipperPermissions() {
      try {
        const isPermissionGranted = await browser.permissions.request(
          this.buildClipperPermissionsObject()
        )
        if (isPermissionGranted) {
          this.showPermissionsNotification = false
          await this.injectClipperScript()
        }
      } catch (e) {
        console.error(e)
        alert(NO_CLIP_MESSAGE)
      }
    },
    cancelRequestPageClipperPermissions() {
      this.showPermissionsNotification = false
    }
  },
  computed: {
    store() {
      return store
    },
    tabCount: function () {
      return getTabCount(store.urlList, store.deduplicateURLsChecked)
    }
  }
}
</script>

<style scoped></style>
