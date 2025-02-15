import { describe, it, beforeEach, vi, expect } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import App from '../BrowserAction.vue'
import { BrowserStorageKey } from '../components/store/browser-storage'
import { NEW_CONTAINER_ID, NO_CONTAINER_ID } from '../components/logic/containers'

const MOCK_CONTAINER_ID = '123'
const MOCK_NEW_CONTAINER_ID = '123-new'
const MOCK_CONTAINER_NAME = 'Mock Container'

let mockStore: Record<string, string> = {}
let tabCreateMockCalls: any[] = []
let searchQueryMockCalls: any[] = []
let createContainerMockCalls: any[] = []
beforeEach(() => {
  mockStore = {}
  tabCreateMockCalls = []
  searchQueryMockCalls = []
  createContainerMockCalls = []

  vi.mock('webextension-polyfill', () => ({
    default: {
      tabs: {
        create: (props: any) => {
          tabCreateMockCalls.push(props)
          return Promise.resolve({ id: 41 + tabCreateMockCalls.length })
        }
      },
      contextualIdentities: {
        query: () =>
          Promise.resolve([{ cookieStoreId: MOCK_CONTAINER_ID, name: MOCK_CONTAINER_NAME }]),
        create: (props: any) => {
          createContainerMockCalls.push(props)
          return Promise.resolve({ cookieStoreId: MOCK_NEW_CONTAINER_ID })
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
    expect(wrapper.text()).toContain('No Container')
    expect(wrapper.text()).toContain('New Container')
    expect(wrapper.text()).toContain(MOCK_CONTAINER_NAME)
    expect(wrapper.text()).toContain('Extract URLs from text')
    expect(wrapper.text()).toContain('Do not load tabs until selected')
    expect(wrapper.text()).toContain('Load in random order')
    expect(wrapper.text()).toContain('Load in reverse order')
    expect(wrapper.text()).toContain('Preserve input')
    expect(wrapper.text()).toContain('Ignore duplicate URLs')
    expect(wrapper.text()).toContain('Handle Non-URLs as search queries')
  })

  describe('features', () => {
    it('opens urls in new tabs in new container', async () => {
      const wrapper = mount(App)
      await flushPromises()

      await wrapper
        .find('textarea#urls')
        .setValue('https://github.com\nhttps://github.com/htrinter/')
      await wrapper.find('select#containerSelection').setValue(NEW_CONTAINER_ID)

      expect(tabCreateMockCalls.length).toBe(0)
      expect(createContainerMockCalls).toHaveLength(0)

      await wrapper.find('button#open').trigger('click')

      expect(tabCreateMockCalls.length).toBe(2)
      expect(createContainerMockCalls).toHaveLength(1)
      expect(tabCreateMockCalls[0]).toEqual({
        active: false,
        cookieStoreId: MOCK_NEW_CONTAINER_ID,
        url: 'https://github.com'
      })
    })

    it('opens urls in new tabs in existing container', async () => {
      const wrapper = mount(App)
      await flushPromises()

      await wrapper
        .find('textarea#urls')
        .setValue('https://github.com\nhttps://github.com/htrinter/')
      await wrapper.find('select#containerSelection').setValue(MOCK_CONTAINER_ID)

      expect(tabCreateMockCalls.length).toBe(0)
      expect(createContainerMockCalls).toHaveLength(0)

      await wrapper.find('button#open').trigger('click')

      expect(tabCreateMockCalls.length).toBe(2)
      expect(createContainerMockCalls).toHaveLength(0)
    })
  })

  describe('storage get', () => {
    it('renders with default options', async () => {
      const wrapper = mount(App)
      await flushPromises()
      expect((wrapper.find('select#containerSelection').element as HTMLInputElement).value).toBe(
        NO_CONTAINER_ID
      )
    })

    const renderWithStoredValuesTestCases = [
      {
        storeKey: BrowserStorageKey.selectedContainerId,
        value: String(MOCK_CONTAINER_ID),
        expectedStates: {
          selectedContainerId: MOCK_CONTAINER_ID
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

        expect((wrapper.find('select#containerSelection').element as HTMLInputElement).value).toBe(
          String(expectedStates.selectedContainerId)
        )
      }
    )
  })

  describe('storage set', () => {
    const storeContainerStateTestCases = [
      { selectedContainerId: NO_CONTAINER_ID },
      { selectedContainerId: NEW_CONTAINER_ID },
      { selectedContainerId: MOCK_CONTAINER_ID }
    ]
    it.each(storeContainerStateTestCases)(
      'stores $selectedContainerId container select state',
      async ({ selectedContainerId }) => {
        const storeKey = BrowserStorageKey.selectedContainerId

        const wrapper = mount(App, { attachTo: document.body })
        await flushPromises()

        const select = wrapper.find('select#containerSelection')

        expect(mockStore[storeKey]).toBeFalsy()

        await select.setValue(selectedContainerId)
        expect((select.element as HTMLSelectElement).value).toBe(String(selectedContainerId))
        expect(mockStore[storeKey]).toBe(selectedContainerId)
      }
    )
  })
})
