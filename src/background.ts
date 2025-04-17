import browser from 'webextension-polyfill'
import { NEW_TAB_GROUP_ID, NO_TAB_GROUP_ID } from './browseraction/components/logic/tabgroups'
import { CONTAINER_COLORS, NEW_CONTAINER_ID, NO_CONTAINER_ID } from './browseraction/components/logic/containers'
import { canLazyLoad, hasValidSchema } from './browseraction/components/logic/urlschema'
import type { LoadSitesMessage } from './types'

/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
const shuffle = (a: string[]) => {
  let j, x, i
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1))
    x = a[i]
    a[i] = a[j]
    a[j] = x
  }
  return a
}

const splitInputLines = (text: string, deduplicate: boolean): string[] => {
  const urlLineSplitRegex = /\r\n?|\n/g
  const urls = text.split(urlLineSplitRegex).filter((line) => line.trim() !== '')
  return deduplicate ? Array.from(new Set(urls)) : urls
}

// Listen for messages from the popup
browser.runtime.onMessage.addListener(async (message: any) => {
  if (message.action === 'loadSites') {
    const loadSitesMessage = message as LoadSitesMessage
    return loadSitesBackground(
      loadSitesMessage.text,
      loadSitesMessage.lazyloading,
      loadSitesMessage.random,
      loadSitesMessage.reverse,
      loadSitesMessage.deduplicate,
      loadSitesMessage.handleAsSearchQuery,
      loadSitesMessage.selectedTabGroupId,
      loadSitesMessage.selectedContainerId
    )
  }
  return false
})

/**
 * Loads sites in new background tabs from the background script
 */
const loadSitesBackground = async (
  text: string,
  lazyloading: boolean,
  random: boolean,
  reverse: boolean,
  deduplicate: boolean,
  handleAsSearchQuery: boolean,
  selectedTabGroupId: number | null | undefined = undefined,
  selectedContainerId: string | null | undefined = undefined
): Promise<void> => {
  let lines = splitInputLines(text, deduplicate)

  if (reverse) {
    lines = lines.reverse()
  }

  if (random) {
    lines = shuffle(lines)
  }

  const createdTabs: browser.Tabs.Tab[] = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line === '') {
      continue
    }

    const hasSchema = hasValidSchema(line)
    const isSearchQuery = !hasSchema && handleAsSearchQuery

    let url = line
    if (!hasSchema && !isSearchQuery) {
      url = 'http://' + url
    }

    if (lazyloading && canLazyLoad(url) && !isSearchQuery) {
      url = browser.runtime.getURL('lazyloading.html#') + url
    }

    if (selectedContainerId === NEW_CONTAINER_ID) {
      selectedContainerId = (
        await browser.contextualIdentities.create({
          name: 'OMU ' + new Date().toLocaleString(),
          color: CONTAINER_COLORS[Math.floor(Math.random() * CONTAINER_COLORS.length)],
          icon: 'circle'
        })
      ).cookieStoreId
    }

    const tabCreateProperties: browser.Tabs.CreateCreatePropertiesType = {
      url: isSearchQuery ? 'about:blank' : url,
      active: false
    }
    if (selectedContainerId != null && selectedContainerId !== NO_CONTAINER_ID) {
      tabCreateProperties.cookieStoreId = selectedContainerId
    }

    try {
      const createdTab = await browser.tabs.create(tabCreateProperties)
      createdTabs.push(createdTab)

      if (isSearchQuery) {
        await browser.search.query({ text: url, tabId: createdTab.id })
      }
    } catch (error) {
      console.error('Failed to create tab', tabCreateProperties, error)
    }
  }

  if (selectedTabGroupId != null && selectedTabGroupId !== NO_TAB_GROUP_ID) {
    await browser.tabs.group?.({
      tabIds: createdTabs.map((tab) => tab.id || -1),
      groupId: selectedTabGroupId === NEW_TAB_GROUP_ID ? undefined : selectedTabGroupId
    })
  }
}