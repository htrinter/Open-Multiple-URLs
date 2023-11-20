import browser from 'webextension-polyfill'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadSites } from '@/browseraction/components/logic/load'

vi.mock('webextension-polyfill', () => ({
  default: { tabs: { create: vi.fn() }, runtime: { getURL: (val) => val } }
}))

const url1 = 'https://test.de'
const url2 = 'https://example.com'
const urlList = url1 + '\n' + url2

describe('load tabs', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('load tabs in sequence', async () => {
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

  // Repeat for each test case, replacing 'test' with 'it' and using 'vi' for mocks
  // ...

  it('lazyload tabs in reverse order', async () => {
    loadSites(urlList, true, false, true)

    expect(browser.tabs.create).toHaveBeenCalledWith({
      url: 'lazyloading.html#' + url2,
      active: false
    })
    expect(browser.tabs.create).toHaveBeenCalledWith({
      url: 'lazyloading.html#' + url1,
      active: false
    })
  })

  // ... other test cases
})
