import browser from 'webextension-polyfill'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getTabCount, getURLsFromText, loadSites } from '@/browseraction/components/logic/load'

vi.mock('webextension-polyfill', () => ({
  default: { tabs: { create: vi.fn() }, runtime: { getURL: (val: string) => val } }
}))

const url1 = 'https://test.de'
const url2 = 'https://example.com'
const urlList = url1 + '\n' + url2

describe('load tabs', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('loads tabs in sequence', async () => {
    loadSites(urlList, false, false, false, false)

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

  it('lazy loads tabs', async () => {
    loadSites(urlList, true, false, false, false)

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
    loadSites(urlList, false, true, false, false)

    expect(browser.tabs.create).toHaveBeenCalledTimes(2)
  })

  it('loads tabs in reverse order', async () => {
    loadSites(urlList, false, false, true, false)

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
    loadSites(`${urlList}\n${urlList}\n${urlList}\n${urlList}`, false, false, false, true)

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
    loadSites('test.de', false, false, true, false)

    expect(browser.tabs.create).toHaveBeenNthCalledWith(1, {
      url: 'http://test.de',
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
})
