import { describe, it, beforeEach, vi, expect } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import App from '../BrowserAction.vue'
import { BrowserStorageKey } from '../components/store/browser-storage'
import {
  NEW_CONTAINER_ID,
  NEW_CONTAINER_TITLE,
  NO_CONTAINER_ID,
  NO_CONTAINER_TITLE
} from '../components/logic/containers'
import { NEW_TAB_GROUP_TITLE, NO_TAB_GROUP_TITLE } from '../components/logic/tabgroups'

const MOCK_CONTAINER_ID = '123'
const MOCK_CONTAINER_NAME = 'Mock Container'

let mockStore: Record<string, string> = {}
let sendMessageCalls: any[] = []
beforeEach(() => {
  mockStore = {}
  sendMessageCalls = []

  vi.mock('webextension-polyfill', () => ({
    default: {
      contextualIdentities: {
        query: () =>
          Promise.resolve([{ cookieStoreId: MOCK_CONTAINER_ID, name: MOCK_CONTAINER_NAME }])
      },

      runtime: {
        getURL: (val: string) => val,
        sendMessage: (message: any) => {
          sendMessageCalls.push(message)
          return Promise.resolve()
        },
        onMessage: {
          addListener: vi.fn()
        }
      },
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
    expect(wrapper.text()).toContain(NO_CONTAINER_TITLE)
    expect(wrapper.text()).toContain(NEW_CONTAINER_TITLE)
    expect(wrapper.text()).toContain(MOCK_CONTAINER_NAME)
    expect(wrapper.text()).not.toContain(NO_TAB_GROUP_TITLE)
    expect(wrapper.text()).not.toContain(NEW_TAB_GROUP_TITLE)
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

      await wrapper.find('button#open').trigger('click')

      expect(sendMessageCalls).toHaveLength(1)
      expect(sendMessageCalls[0]).toEqual({
        action: 'loadSites',
        deduplicate: false,
        handleAsSearchQuery: false,
        lazyloading: false,
        random: false,
        reverse: false,
        selectedContainerId: 'NEW_CONTAINER_ID',
        selectedTabGroupId: -1,
        text: 'https://github.com\nhttps://github.com/htrinter/'
      })
    })

    it('opens urls in new tabs in existing container', async () => {
      const wrapper = mount(App)
      await flushPromises()

      await wrapper
        .find('textarea#urls')
        .setValue('https://github.com\nhttps://github.com/htrinter/')
      await wrapper.find('select#containerSelection').setValue(MOCK_CONTAINER_ID)

      await wrapper.find('button#open').trigger('click')

      expect(sendMessageCalls).toHaveLength(1)
      expect(sendMessageCalls[0]).toEqual({
        action: 'loadSites',
        deduplicate: false,
        handleAsSearchQuery: false,
        lazyloading: false,
        random: false,
        reverse: false,
        selectedContainerId: '123',
        selectedTabGroupId: -1,
        text: 'https://github.com\nhttps://github.com/htrinter/'
      })
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
          expectedStates.selectedContainerId
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
