import { describe, it, beforeEach, vi, expect } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import App from '../BrowserAction.vue'

let mockStore: Record<string, string> = {}
let tabCreateMockCallCount = 0
beforeEach(() => {
  mockStore = {}
  tabCreateMockCallCount = 0

  vi.mock('webextension-polyfill', () => ({
    default: {
      tabs: {
        create: () => {
          tabCreateMockCallCount++
          return Promise.resolve({ id: 41 + tabCreateMockCallCount })
        }
      },
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

describe('browser action without tab group support', () => {
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
  })

  describe('features', () => {
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
  })
})
