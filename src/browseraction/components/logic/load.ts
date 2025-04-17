import browser from 'webextension-polyfill'
import { canLazyLoad, hasValidSchema } from './urlschema'
import { CONTAINER_COLORS, NEW_CONTAINER_ID, NO_CONTAINER_ID } from './containers'
import { NEW_TAB_GROUP_ID, NO_TAB_GROUP_ID } from './tabgroups'

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

/**
 * Splits input text into lines and removes duplicates if specified.
 * @param {string} text The input text to split.
 * @param {boolean} deduplicate Whether to remove duplicate lines.
 * @returns {string[]} An array of lines from the input text.
 */
export const splitInputLines = (text: string, deduplicate: boolean): string[] => {
  const urlLineSplitRegex = /\r\n?|\n/g
  const urls = text.split(urlLineSplitRegex).filter((line) => line.trim() !== '')
  return deduplicate ? Array.from(new Set(urls)) : urls
}

/**
 * Loads URLs from the input text into new tabs.
 * @param {string} text The input text containing URLs.
 * @param {boolean} lazyloading Whether to use lazy loading.
 * @param {boolean} random Whether to shuffle the URLs.
 * @param {boolean} reverse Whether to reverse the order of URLs.
 * @param {boolean} deduplicate Whether to remove duplicate URLs.
 * @param {boolean} handleAsSearchQuery Whether to handle as search query.
 * @param {number|null|undefined} selectedTabGroupId The ID of the selected tab group.
 * @param {string|null|undefined} selectedContainerId The ID of the selected container.
 */
export const loadSites = async (
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

export const getTabCount = (text: string, deduplicate: boolean) => {
  return text ? splitInputLines(text, deduplicate).length : 0
}
