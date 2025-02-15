import { describe, it, beforeEach, vi, expect } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import App from '../BrowserAction.vue'
import { BrowserStorageKey } from '../components/store/browser-storage'

let mockStore: Record<string, string> = {}
let tabCreateMockCallCount = 0
let searchQueryMockCalls: any[] = []

beforeEach(() => {
  mockStore = {}
  tabCreateMockCallCount = 0
  searchQueryMockCalls = []

  vi.mock('webextension-polyfill', () => ({
    default: {
      tabs: {
        create: () => {
          tabCreateMockCallCount++
          return Promise.resolve({ id: 41 + tabCreateMockCallCount })
        }
      },
      search: {
        query: (props: any) => searchQueryMockCalls.push(props)
      },
      runtime: { getURL: (val: string) => val },
      storage: {
        local: {
          get: (key: string | string[]) => {
            if (Array.isArray(key)) {
              return key.reduce((acc, k) => ({ ...acc, [k]: mockStore[k] }), {})
            }
            return { [key]: mockStore[key] }
          },
          set: (val: any) => (mockStore = { ...mockStore, ...val }) // eslint-disable-line @typescript-eslint/no-explicit-any
        }
      }
    }
  }))
})

describe('browser action', () => {
  it('renders elements', async () => {
    const wrapper = mount(App)
    await flushPromises()
    expect(wrapper.text()).toContain('List of URLs / Text to extract URLs from:')
    expect(wrapper.text()).toContain('Open URLs')
    expect(wrapper.text()).not.toContain('No Tab Group')
    expect(wrapper.text()).not.toContain('New Tab Group')
    expect(wrapper.text()).toContain('Extract URLs from text')
    expect(wrapper.text()).toContain('Do not load tabs until selected')
    expect(wrapper.text()).toContain('Load in random order')
    expect(wrapper.text()).toContain('Load in reverse order')
    expect(wrapper.text()).toContain('Preserve input')
    expect(wrapper.text()).toContain('Ignore duplicate URLs')
    expect(wrapper.text()).toContain('Handle Non-URLs as search queries')
  })

  describe('features', () => {
    it('extracts urls from text', async () => {
      const wrapper = mount(App)
      await flushPromises()
      const urlInput = wrapper.find('textarea#urls')

      await urlInput.setValue('foo https://github.com bar')
      await wrapper.find('button#extract').trigger('click')
      expect((urlInput.element as HTMLInputElement).value).toBe('https://github.com\n')
    })

    it('opens urls in new tabs', async () => {
      const wrapper = mount(App)
      await flushPromises()

      await wrapper
        .find('textarea#urls')
        .setValue('https://github.com\nhttps://github.com/htrinter/')

      expect(tabCreateMockCallCount).toBe(0)

      await wrapper.find('button#open').trigger('click')

      expect(tabCreateMockCallCount).toBe(2)
      expect(searchQueryMockCalls).toHaveLength(0)
    })

    it('does not handle non-urls as search queries', async () => {
      const wrapper = mount(App)
      await flushPromises()

      await wrapper.find('textarea#urls').setValue('test')

      await wrapper.find('button#open').trigger('click')

      expect(tabCreateMockCallCount).toBe(1)
      expect(searchQueryMockCalls).toHaveLength(0)
    })

    it('handles non-urls as search queries', async () => {
      mockStore = {
        [BrowserStorageKey.handleAsSearchQuery]: String(true)
      }

      const wrapper = mount(App)
      await flushPromises()

      await wrapper.find('textarea#urls').setValue('test')

      await wrapper.find('button#open').trigger('click')

      expect(tabCreateMockCallCount).toBe(1)
      expect(searchQueryMockCalls).toHaveLength(1)
      expect(searchQueryMockCalls[0]).toEqual({
        text: 'test',
        tabId: 42
      })
    })

    it('displays tab count', async () => {
      const wrapper = mount(App)
      await flushPromises()
      const urlInput = wrapper.find('textarea#urls')

      await urlInput.setValue('1')
      expect(wrapper.text()).toContain('Open URLs (1)')

      await urlInput.setValue('1\n2\n3\n4')
      expect(wrapper.text()).toContain('Open URLs (4)')
    })

    it('displays tab count warning', async () => {
      const warning = '⚠'

      const wrapper = mount(App)
      await flushPromises()
      const urlInput = wrapper.find('textarea#urls')

      await urlInput.setValue('')
      expect(wrapper.text()).not.toContain(warning)

      await urlInput.setValue('1')
      expect(wrapper.text()).not.toContain(warning)

      await urlInput.setValue('1\n'.repeat(24))
      expect(wrapper.text()).not.toContain(warning)

      await urlInput.setValue('1\n'.repeat(25))
      expect(wrapper.text()).toContain(warning)
    })
  })

  describe('storage get', () => {
    it('renders with default options', async () => {
      const wrapper = mount(App)
      await flushPromises()
      expect((wrapper.find('textarea#urls').element as HTMLInputElement).value).toBe('')
      expect(
        (wrapper.find('input[type="checkbox"]#lazyLoad').element as HTMLInputElement).checked
      ).toBeFalsy()
      expect(
        (wrapper.find('input[type="checkbox"]#random').element as HTMLInputElement).checked
      ).toBeFalsy()
      expect(
        (wrapper.find('input[type="checkbox"]#reverse').element as HTMLInputElement).checked
      ).toBeFalsy()
      expect(
        (wrapper.find('input[type="checkbox"]#preserve').element as HTMLInputElement).checked
      ).toBeFalsy()
      expect(
        (wrapper.find('input[type="checkbox"]#deduplicate').element as HTMLInputElement).checked
      ).toBeFalsy()
    })

    const renderWithStoredValuesTestCases = [
      {
        storeKey: BrowserStorageKey.urlList,
        value: 'foobar',
        expectedStates: {
          lazyLoad: false,
          random: false,
          reverse: false,
          preserve: false,
          deduplicate: false,
          searchquery: false
        }
      },
      {
        storeKey: BrowserStorageKey.lazyload,
        value: 'true',
        expectedStates: {
          lazyLoad: true,
          random: false,
          reverse: false,
          preserve: false,
          deduplicate: false,
          searchquery: false
        }
      },
      {
        storeKey: BrowserStorageKey.random,
        value: 'true',
        expectedStates: {
          lazyLoad: false,
          random: true,
          reverse: false,
          preserve: false,
          deduplicate: false,
          searchquery: false
        }
      },
      {
        storeKey: BrowserStorageKey.reverse,
        value: 'true',
        expectedStates: {
          lazyLoad: false,
          random: false,
          reverse: true,
          preserve: false,
          deduplicate: false,
          searchquery: false
        }
      },
      {
        storeKey: BrowserStorageKey.preserve,
        value: 'true',
        expectedStates: {
          lazyLoad: false,
          random: false,
          reverse: false,
          preserve: true,
          deduplicate: false,
          searchquery: false
        }
      },
      {
        storeKey: BrowserStorageKey.deduplicate,
        value: 'true',
        expectedStates: {
          lazyLoad: false,
          random: false,
          reverse: false,
          preserve: false,
          deduplicate: true,
          searchquery: false
        }
      },
      {
        storeKey: BrowserStorageKey.handleAsSearchQuery,
        value: 'true',
        expectedStates: {
          lazyLoad: false,
          random: false,
          reverse: false,
          preserve: false,
          deduplicate: false,
          searchquery: true
        }
      }
    ]
    it.each(renderWithStoredValuesTestCases)(
      'renders with stored $storeKey',
      async ({ storeKey, value, expectedStates }) => {
        mockStore = {
          [storeKey]: value
        }

        const wrapper = mount(App)
        await flushPromises()

        const textareaValue = storeKey === BrowserStorageKey.urlList ? value : ''
        expect((wrapper.find('textarea#urls').element as HTMLInputElement).value).toBe(
          textareaValue
        )
        expect(
          (wrapper.find('input[type="checkbox"]#lazyLoad').element as HTMLInputElement).checked
        ).toBe(expectedStates.lazyLoad)
        expect(
          (wrapper.find('input[type="checkbox"]#random').element as HTMLInputElement).checked
        ).toBe(expectedStates.random)
        expect(
          (wrapper.find('input[type="checkbox"]#reverse').element as HTMLInputElement).checked
        ).toBe(expectedStates.reverse)
        expect(
          (wrapper.find('input[type="checkbox"]#preserve').element as HTMLInputElement).checked
        ).toBe(expectedStates.preserve)
        expect(
          (wrapper.find('input[type="checkbox"]#deduplicate').element as HTMLInputElement).checked
        ).toBe(expectedStates.deduplicate)
        expect(
          (wrapper.find('input[type="checkbox"]#searchquery').element as HTMLInputElement).checked
        ).toBe(expectedStates.searchquery)
      }
    )
  })

  describe('storage set', () => {
    it('stores url list', async () => {
      mockStore = {
        [BrowserStorageKey.preserve]: 'true'
      }

      const wrapper = mount(App)
      await flushPromises()

      const text = 'https://github.com\nhttps://github.com/htrinter/'
      await wrapper.find('textarea#urls').setValue(text)
      expect(mockStore[BrowserStorageKey.urlList]).toBe(text)
    })

    const storeCheckStateTestCases = [
      { checkboxId: 'lazyLoad', storeKey: BrowserStorageKey.lazyload },
      { checkboxId: 'random', storeKey: BrowserStorageKey.random },
      { checkboxId: 'reverse', storeKey: BrowserStorageKey.reverse },
      { checkboxId: 'preserve', storeKey: BrowserStorageKey.preserve },
      { checkboxId: 'deduplicate', storeKey: BrowserStorageKey.deduplicate },
      { checkboxId: 'searchquery', storeKey: BrowserStorageKey.handleAsSearchQuery }
    ]
    it.each(storeCheckStateTestCases)(
      'stores $checkboxId check state',
      async ({ checkboxId, storeKey }) => {
        const wrapper = mount(App, { attachTo: document.body })
        await flushPromises()

        const checkboxSelector = `input[type="checkbox"]#${checkboxId}`
        const checkbox = wrapper.find(checkboxSelector)

        expect(mockStore[storeKey]).toBeFalsy()

        await checkbox.trigger('click')
        expect((checkbox.element as HTMLInputElement).checked).toBeTruthy()
        expect(mockStore[storeKey]).toBeTruthy()

        await checkbox.trigger('click')
        expect((checkbox.element as HTMLInputElement).checked).toBeFalsy()
        expect(mockStore[storeKey]).toBeFalsy()

        await checkbox.trigger('click')
        expect((checkbox.element as HTMLInputElement).checked).toBeTruthy()
        expect(mockStore[storeKey]).toBeTruthy()
      }
    )
  })
})
