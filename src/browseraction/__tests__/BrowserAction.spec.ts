import { describe, it, beforeEach, vi, expect } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import App from '../BrowserAction.vue'
import { BrowserStorageKey } from '../components/store/browser-storage'

let mockStore: Record<string, string> = {}
let tabCreateMockCallCount: number = 0
beforeEach(() => {
  mockStore = {}
  tabCreateMockCallCount = 0
  vi.mock('webextension-polyfill', () => ({
    default: {
      tabs: { create: () => tabCreateMockCallCount++ },
      runtime: { getURL: (val: string) => val },
      storage: {
        local: {
          get: (key: string) => {
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
    expect(wrapper.text()).toContain('Extract URLs from text')
    expect(wrapper.text()).toContain('Do not load tabs until selected')
    expect(wrapper.text()).toContain('Load in random order')
    expect(wrapper.text()).toContain('Load in reverse order')
    expect(wrapper.text()).toContain('Preserve input')
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
    })

    it('displays tab count', async () => {
      const wrapper = mount(App)
      await flushPromises()
      const urlInput = wrapper.find('textarea#urls')

      expect(wrapper.text()).not.toContain('will open')

      await urlInput.setValue('1')
      expect(wrapper.text()).toContain('will open 1 new tab')

      await urlInput.setValue('1\n2\n3\n4')
      expect(wrapper.text()).toContain('will open 4 new tabs')

      await urlInput.setValue('\n\n')
      expect(wrapper.text()).not.toContain('will open')
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
    })

    const renderWithStoredValuesTestCases = [
      {
        storeKey: BrowserStorageKey.urlList,
        value: 'foobar',
        expectedStates: { lazyLoad: false, random: false, reverse: false, preserve: false }
      },
      {
        storeKey: BrowserStorageKey.lazyload,
        value: 'true',
        expectedStates: { lazyLoad: true, random: false, reverse: false, preserve: false }
      },
      {
        storeKey: BrowserStorageKey.random,
        value: 'true',
        expectedStates: { lazyLoad: false, random: true, reverse: false, preserve: false }
      },
      {
        storeKey: BrowserStorageKey.reverse,
        value: 'true',
        expectedStates: { lazyLoad: false, random: false, reverse: true, preserve: false }
      },
      {
        storeKey: BrowserStorageKey.preserve,
        value: 'true',
        expectedStates: { lazyLoad: false, random: false, reverse: false, preserve: true }
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
      { checkboxId: 'preserve', storeKey: BrowserStorageKey.preserve }
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
