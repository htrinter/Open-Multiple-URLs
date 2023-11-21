import browser from 'webextension-polyfill'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getTabCount, loadSites } from '@/browseraction/components/logic/load'

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
    loadSites(urlList, false, false, false)

    expect(browser.tabs.create).toHaveBeenNthCalledWith(1, {
      url: url1,
      active: false
    })
    expect(browser.tabs.create).toHaveBeenNthCalledWith(2, {
      url: url2,
      active: false
    })
  })

  it('lazy loads tabs', async () => {
    loadSites(urlList, true, false, false)

    expect(browser.tabs.create).toHaveBeenCalledWith({
      url: 'lazyloading.html#' + url1,
      active: false
    })
    expect(browser.tabs.create).toHaveBeenCalledWith({
      url: 'lazyloading.html#' + url2,
      active: false
    })
  })

  it('loads tabs in random order', async () => {
    loadSites(urlList, false, true, false)

    expect(browser.tabs.create).toHaveBeenCalled(2)
  })

  it('loads tabs in reverse order', async () => {
    loadSites(urlList, false, false, true)

    expect(browser.tabs.create).toHaveBeenNthCalledWith(1, {
      url: url2,
      active: false
    })
    expect(browser.tabs.create).toHaveBeenNthCalledWith(2, {
      url: url1,
      active: false
    })
  })

  it('appends http protocol if protocol does not exist', async () => {
    loadSites('test.de', false, false, true)

    expect(browser.tabs.create).toHaveBeenNthCalledWith(1, {
      url: 'http://test.de',
      active: false
    })
  })

  it('determines tab count correctly', () => {
    expect(getTabCount('')).toBe('0')
    expect(getTabCount(url1)).toBe('1')
    expect(getTabCount(urlList)).toBe('2')
    expect(getTabCount(`url1\n`.repeat(5000))).toBe('5000')
    expect(getTabCount(`url1\n`.repeat(5001))).toBe('> 5000')
  })
})
