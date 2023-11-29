<template>
  <section id="action-bar">
    <button id="extract" tabindex="6" @click="setUrlListInputData">Extract URLs from text</button>
    <button id="clipper" tabindex="6" @click="invokePageClipper(false)">Clip links from page</button>
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
  <section id="permissions-notification" v-if="showPermissionsNotification">
    <button id="cancel-grant-permissions" @click="cancelGrantPermissions">Cancel</button>
    <button id="grant-permissions" @click="invokePageClipper(true)"><strong>Grant permission</strong></button>
    To clip links from web pages, the extension requires permission to access page contents.
  </section>
</template>

<script lang="ts">
import { getTabCount, loadSites } from '@/browseraction/components/logic/load'
import { extractURLs } from '@/browseraction/components/logic/extract'
import { store } from '@/browseraction/components/store/store'
import browser from 'webextension-polyfill'
import { version } from '../../../package.json'

export default {
  data() {
    return {
      showPermissionsNotification: false
    }
  },
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
      store.setUrlList(extractURLs(store.urlList))
    },
    cancelGrantPermissions() {
      this.showPermissionsNotification = false
    },
    async invokePageClipper(isGrantPermissionsRequest: boolean) {
      const permissions: browser.Permissions.Permissions = {
        permissions: ["activeTab", "scripting"],
        origins: ["*://*/*"]
      }

      if (isGrantPermissionsRequest) {
        const isPermissionGranted = await browser.permissions.request(permissions)
        if (isPermissionGranted) {
          this.showPermissionsNotification = false
          await this.invokePageClipper(false)
        }
        return
      } else {
        const hasPermissions = await browser.permissions.contains(permissions)
        if (!hasPermissions) {
          this.showPermissionsNotification = true
          return
        }
      }

      try {
        const currentTab = await browser.tabs.query({ active: true, currentWindow: true })
        const currentTabId = currentTab[0]?.id

        if (currentTabId !== undefined) {
          const executeResponse = await browser.scripting.executeScript({
            target: { tabId: currentTabId, allFrames: true },
            files: [`assets/ClipperContentScript-${version}.js`]
          })

          console.log("executeResponse", executeResponse)

          if (!executeResponse || executeResponse.filter(r => !r).length) {
            alert("Clipping is not possible on this page.")
          } else {
            window.close()
          }
        }
      } catch (e) {
        alert((e as Error).message)
      }
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
