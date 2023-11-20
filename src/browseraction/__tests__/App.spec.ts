import { describe, it, beforeEach, vi } from 'vitest'

let mockStore: Record<string, string> = {}
beforeEach(() => {
  vi.mock('webextension-polyfill', () => ({
    tabs: { create: vi.fn() },
    runtime: { getURL: (val: string) => val },
    storage: {
      local: {
        get: (key: string) => {
          return { [key]: mockStore[key] }
        },
        set: (val: any) => (mockStore = { ...mockStore, ...val }) // eslint-disable-line @typescript-eslint/no-explicit-any
      }
    }
  }))
})

describe('App', () => {
  it('renders properly', () => {
    /*const wrapper = mount(App)
    expect(wrapper.text()).toContain('List of URLs / Text to extract URLs from:')*/
  })
})
