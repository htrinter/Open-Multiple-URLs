import { describe, it, expect, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import App from '../LazyLoading.vue'
import type { URL } from 'node:url'

describe('lazy loading', () => {
  describe('set title', () => {
    it('omits https protocol', () => {
      window.location.hash = '#https://github.com'
      mount(App)
      expect(document.title).toBe('[github.com]')
    })

    it('omits http protocol', () => {
      window.location.hash = '#http://github.com'
      mount(App)
      expect(document.title).toBe('[github.com]')
    })

    it('omits trailing slash', () => {
      window.location.hash = '#https://github.com/htrinter/'
      mount(App)
      expect(document.title).toBe('[github.com/htrinter]')
    })
  })

  it('navigates on focus', async () => {
    const originalLocation = window.location
    delete window.location
    window.location = {
      ...originalLocation,
      replace: vi.fn()
    }

    window.location.hash = '#https://github.com/htrinter/'
    mount(App)
    window.dispatchEvent(new Event('focus'))
    expect(window.location.replace).toHaveBeenCalledWith('https://github.com/htrinter/')

    window.location = originalLocation
  })
})
