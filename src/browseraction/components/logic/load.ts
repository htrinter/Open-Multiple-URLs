import browser from 'webextension-polyfill'
import { NEW_TAB_GROUP_ID, NO_TAB_GROUP_ID } from './tabgroups'
import { canLazyLoad, hasValidSchema } from './urlschema'

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
 * Loads sites in new background tabs
 * @param text Text containing one URL per line
 * @param lazyloading Lazy-load tabs
 * @param random Open tabs in random order
 * @param reverse Open tabs in reverse order
 * @param deduplicate Ignores duplicate URLs on open
 */
export const loadSites = async (
  text: string,
  lazyloading: boolean,
  random: boolean,
  reverse: boolean,
  deduplicate: boolean,
  handleAsSearchQuery: boolean,
  selectedTabGroupId: number | null | undefined
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
      url = 'https://' + url
    }

    if (lazyloading && canLazyLoad(url) && !isSearchQuery) {
      url = browser.runtime.getURL('lazyloading.html#') + url
    }

    const createdTab = await browser.tabs.create({
      url: url,
      active: false
    })
    createdTabs.push(createdTab)

    if (isSearchQuery) {
      await browser.search.query({ text: url, tabId: createdTab?.id || -1 })
    }
  }

  if (selectedTabGroupId != null && selectedTabGroupId !== NO_TAB_GROUP_ID) {
    await browser.tabs.group?.({
      tabIds: createdTabs.map((tab) => tab?.id || -1),
      groupId: selectedTabGroupId === NEW_TAB_GROUP_ID ? undefined : selectedTabGroupId
    })
  }
}

export const getTabCount = (text: string, deduplicate: boolean) => {
  return text ? splitInputLines(text, deduplicate).length : 0
}

export const splitInputLines = (text: string, deduplicate: boolean): string[] => {
  const urlLineSplitRegex = /\r\n?|\n/g
  const urls = text.split(urlLineSplitRegex).filter((line) => line.trim() !== '')
  return deduplicate ? Array.from(new Set(urls)) : urls
}
