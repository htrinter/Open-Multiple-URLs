import browser from 'webextension-polyfill'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getTabCount, getURLsFromText, loadSites } from '@/browseraction/components/logic/load'
import { NEW_TAB_GROUP_ID, NO_TAB_GROUP_ID } from '@/browseraction/components/logic/tabgroups'

const MOCK_TAB_GROUP_ID = 42

vi.mock('webextension-polyfill', () => ({
  default: {
    tabs: {
      create: vi.fn(),
      group: vi.fn()
    },
    runtime: { getURL: (val: string) => val }
  }
}))

const url1 = 'https://test.de'
const url2 = 'https://example.com'
const urlList = url1 + '\n' + url2

describe('load tabs', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('loads tabs in sequence', async () => {
    await loadSites(urlList, false, false, false, false, null)

    expect(browser.tabs.create).toHaveBeenNthCalledWith(1, {
      url: url1,
      active: false
    })
    expect(browser.tabs.create).toHaveBeenNthCalledWith(2, {
      url: url2,
      active: false
    })
    expect(browser.tabs.create).toHaveBeenCalledTimes(2)
    expect(browser.tabs.group).not.toHaveBeenCalled()
  })

  it('lazy loads tabs', async () => {
    await loadSites(urlList, true, false, false, false, null)

    expect(browser.tabs.create).toHaveBeenCalledWith({
      url: 'lazyloading.html#' + url1,
      active: false
    })
    expect(browser.tabs.create).toHaveBeenCalledWith({
      url: 'lazyloading.html#' + url2,
      active: false
    })
    expect(browser.tabs.create).toHaveBeenCalledTimes(2)
  })

  it('loads tabs in random order', async () => {
    await loadSites(urlList, false, true, false, false, null)

    expect(browser.tabs.create).toHaveBeenCalledTimes(2)
  })

  it('loads tabs in reverse order', async () => {
    await loadSites(urlList, false, false, true, false, null)

    expect(browser.tabs.create).toHaveBeenNthCalledWith(1, {
      url: url2,
      active: false
    })
    expect(browser.tabs.create).toHaveBeenNthCalledWith(2, {
      url: url1,
      active: false
    })
    expect(browser.tabs.create).toHaveBeenCalledTimes(2)
  })

  it('loads tabs and deduplicate', async () => {
    await loadSites(
      `${urlList}\n${urlList}\n${urlList}\n${urlList}`,
      false,
      false,
      false,
      true,
      null
    )

    expect(browser.tabs.create).toHaveBeenNthCalledWith(1, {
      url: url1,
      active: false
    })
    expect(browser.tabs.create).toHaveBeenNthCalledWith(2, {
      url: url2,
      active: false
    })
    expect(browser.tabs.create).toHaveBeenCalledTimes(2)
  })

  it('appends http protocol if protocol does not exist', async () => {
    await loadSites('test.de', false, false, true, false, null)

    expect(browser.tabs.create).toHaveBeenNthCalledWith(1, {
      url: 'https://test.de',
      active: false
    })
  })

  it('determines tab count correctly', () => {
    expect(getTabCount('', false)).toBe('0')
    expect(getTabCount(url1, false)).toBe('1')
    expect(getTabCount(urlList, false)).toBe('2')
    expect(getTabCount(`url1\n`.repeat(5000), false)).toBe('5000')
    expect(getTabCount(`url1\n`.repeat(5001), false)).toBe('> 5000')
    expect(getTabCount(`${urlList}\n`.repeat(100), true)).toBe('2')
  })

  it('gets urls from text', () => {
    expect(getURLsFromText('', false)).toEqual([])
    expect(getURLsFromText('\n\n', false)).toEqual([])
    expect(getURLsFromText(urlList, false)).toEqual([url1, url2])
    expect(getURLsFromText(`\n\n\n${urlList}\n\n\n${urlList}\n\n`, false)).toEqual([
      url1,
      url2,
      url1,
      url2
    ])
    expect(getURLsFromText(`\n\n\n${urlList}\n\n\n${urlList}\n\n`, true)).toEqual([url1, url2])
  })

  it('loads tabs without tab group', async () => {
    await loadSites(urlList, false, false, false, false, NO_TAB_GROUP_ID)

    expect(browser.tabs.create).toHaveBeenCalledTimes(2)
    expect(browser.tabs.group).not.toHaveBeenCalled()
  })

  it('loads tabs to new tab group', async () => {
    await loadSites(urlList, false, false, false, false, NEW_TAB_GROUP_ID)

    expect(browser.tabs.create).toHaveBeenCalledTimes(2)
    expect(browser.tabs.group).toBeCalledWith({ tabIds: [-1, -1] })
  })

  it('loads tabs to existing tab group', async () => {
    await loadSites(urlList, false, false, false, false, MOCK_TAB_GROUP_ID)

    expect(browser.tabs.create).toHaveBeenCalledTimes(2)
    expect(browser.tabs.group).toBeCalledWith({ tabIds: [-1, -1], groupId: MOCK_TAB_GROUP_ID })
  })
})
