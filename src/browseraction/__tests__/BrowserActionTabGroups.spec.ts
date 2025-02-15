import { describe, it, beforeEach, vi, expect } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import App from '../BrowserAction.vue'
import { BrowserStorageKey } from '../components/store/browser-storage'
import { NEW_TAB_GROUP_ID, NEW_TAB_GROUP_TITLE, NO_TAB_GROUP_ID, NO_TAB_GROUP_TITLE } from '../components/logic/tabgroups'
import { NEW_CONTAINER_TITLE, NO_CONTAINER_TITLE } from '../components/logic/containers'

const MOCK_TAB_GROUP_ID = 123
const MOCK_TAB_GROUP_TITLE = 'Mock Tab Group'

let mockStore: Record<string, string> = {}
let tabCreateMockCallCount = 0
let searchQueryMockCalls: any[] = []
let tabGroupMockCalls: any[] = []
beforeEach(() => {
  mockStore = {}
  tabCreateMockCallCount = 0
  searchQueryMockCalls = []
  tabGroupMockCalls = []

  vi.mock('webextension-polyfill', () => ({
    default: {
      tabs: {
        create: () => {
          tabCreateMockCallCount++
          return Promise.resolve({ id: 41 + tabCreateMockCallCount })
        },
        group: (props: any) => tabGroupMockCalls.push(props)
      },
      tabGroups: {
        query: () => Promise.resolve([{ id: MOCK_TAB_GROUP_ID, title: MOCK_TAB_GROUP_TITLE }])
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
    expect(wrapper.text()).toContain(NO_TAB_GROUP_TITLE)
    expect(wrapper.text()).toContain(NEW_TAB_GROUP_TITLE)
    expect(wrapper.text()).toContain(MOCK_TAB_GROUP_TITLE)
    expect(wrapper.text()).not.toContain(NO_CONTAINER_TITLE)
    expect(wrapper.text()).not.toContain(NEW_CONTAINER_TITLE)
    expect(wrapper.text()).toContain('Extract URLs from text')
    expect(wrapper.text()).toContain('Do not load tabs until selected')
    expect(wrapper.text()).toContain('Load in random order')
    expect(wrapper.text()).toContain('Load in reverse order')
    expect(wrapper.text()).toContain('Preserve input')
    expect(wrapper.text()).toContain('Ignore duplicate URLs')
    expect(wrapper.text()).toContain('Handle Non-URLs as search queries')
  })

  describe('features', () => {
    it('opens urls in new tabs in new tab group', async () => {
      const wrapper = mount(App)
      await flushPromises()

      await wrapper
        .find('textarea#urls')
        .setValue('https://github.com\nhttps://github.com/htrinter/')
      await wrapper.find('select#tabGroupSelection').setValue(NEW_TAB_GROUP_ID)

      expect(tabCreateMockCallCount).toBe(0)
      expect(tabGroupMockCalls).toHaveLength(0)

      await wrapper.find('button#open').trigger('click')

      expect(tabCreateMockCallCount).toBe(2)
      expect(tabGroupMockCalls).toHaveLength(1)
      expect(tabGroupMockCalls[0]).toEqual({
        tabIds: [42, 43],
        groupId: undefined
      })
    })

    it('opens urls in new tabs in existing tab group', async () => {
      const wrapper = mount(App)
      await flushPromises()

      await wrapper
        .find('textarea#urls')
        .setValue('https://github.com\nhttps://github.com/htrinter/')
      await wrapper.find('select#tabGroupSelection').setValue(MOCK_TAB_GROUP_ID)

      expect(tabCreateMockCallCount).toBe(0)
      expect(tabGroupMockCalls).toHaveLength(0)

      await wrapper.find('button#open').trigger('click')

      expect(tabCreateMockCallCount).toBe(2)
      expect(tabGroupMockCalls).toHaveLength(1)
      expect(tabGroupMockCalls[0]).toEqual({
        tabIds: [42, 43],
        groupId: MOCK_TAB_GROUP_ID
      })
    })
  })

  describe('storage get', () => {
    it('renders with default options', async () => {
      const wrapper = mount(App)
      await flushPromises()
      expect((wrapper.find('select#tabGroupSelection').element as HTMLInputElement).value).toBe(
        String(NO_TAB_GROUP_ID)
      )
    })

    const renderWithStoredValuesTestCases = [
      {
        storeKey: BrowserStorageKey.selectedTabGroupId,
        value: String(MOCK_TAB_GROUP_ID),
        expectedStates: {
          lazyLoad: false,
          random: false,
          reverse: false,
          preserve: false,
          deduplicate: false,
          selectedTabGroupId: MOCK_TAB_GROUP_ID
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

        expect((wrapper.find('select#tabGroupSelection').element as HTMLInputElement).value).toBe(
          String(expectedStates.selectedTabGroupId)
        )
      }
    )
  })

  describe('storage set', () => {
    const storeTabGroupStateTestCases = [
      { selectedTabGroupId: NO_TAB_GROUP_ID },
      { selectedTabGroupId: NEW_TAB_GROUP_ID },
      { selectedTabGroupId: MOCK_TAB_GROUP_ID }
    ]
    it.each(storeTabGroupStateTestCases)(
      'stores $selectedTabGroupId tab group select state',
      async ({ selectedTabGroupId }) => {
        const storeKey = BrowserStorageKey.selectedTabGroupId

        const wrapper = mount(App, { attachTo: document.body })
        await flushPromises()

        const select = wrapper.find('select#tabGroupSelection')

        expect(mockStore[storeKey]).toBeFalsy()

        await select.setValue(selectedTabGroupId)
        expect((select.element as HTMLSelectElement).value).toBe(String(selectedTabGroupId))
        expect(mockStore[storeKey]).toBe(selectedTabGroupId)
      }
    )
  })
})
