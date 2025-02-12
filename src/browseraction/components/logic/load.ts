import browser from 'webextension-polyfill'
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
  selectedTabGroupId: number | null | undefined
): Promise<void> => {
  const urlschemes = ['http', 'https', 'file', 'view-source']
  let urls = getURLsFromText(text, deduplicate)

  if (reverse) {
    urls = urls.reverse()
  }

  if (random) {
    urls = shuffle(urls)
  }

  const createdTabs: Promise<browser.Tabs.Tab>[] = []
  for (let i = 0; i < urls.length; i++) {
    let url = urls[i].trim()
    if (url !== '') {
      if (urlschemes.indexOf(url.split(':')[0]) === -1) {
        url = 'http://' + url
      }

      if (lazyloading && url.split(':')[0] !== 'view-source' && url.split(':')[0] !== 'file') {
        url = browser.runtime.getURL('lazyloading.html#') + url
      }

      const createdTab = browser.tabs.create({
        url: url,
        active: false
      })
      createdTabs.push(createdTab)
    }
  }

  if (selectedTabGroupId != null && selectedTabGroupId !== NO_TAB_GROUP_ID) {
    await Promise.all(createdTabs).then((tabs) => {
      browser.tabs.group?.({
        tabIds: tabs.map((tab) => tab?.id || -1),
        groupId: selectedTabGroupId === NEW_TAB_GROUP_ID ? undefined : selectedTabGroupId
      })
    })
  }
}

export const getTabCount = (text: string, deduplicate: boolean) => {
  let tabCount = '0'
  if (text) {
    const urls = getURLsFromText(text, deduplicate)
    if (urls.length <= 5000) {
      // limit for performance reasons
      tabCount = String(urls.length)
    } else {
      tabCount = '> 5000'
    }
  }
  return tabCount
}

export const getURLsFromText = (text: string, deduplicate: boolean): string[] => {
  const urlLineSplitRegex = /\r\n?|\n/g
  const urls = text.split(urlLineSplitRegex).filter((line) => line.trim() !== '')
  return deduplicate ? Array.from(new Set(urls)) : urls
}
