import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  loadContainers,
  NEW_CONTAINER_ID,
  NEW_CONTAINER_TITLE,
  NO_CONTAINER_ID,
  NO_CONTAINER_TITLE
} from '@/browseraction/components/logic/containers'
import { beforeEach } from 'node:test'
import browser from 'webextension-polyfill'

const c1: Partial<browser.ContextualIdentities.ContextualIdentity> = {
  cookieStoreId: '1',
  name: 'Container 1',
  color: 'red'
}
const c2: Partial<browser.ContextualIdentities.ContextualIdentity> = {
  cookieStoreId: '2',
  name: 'Container 2',
  color: 'blue'
}
const c3: Partial<browser.ContextualIdentities.ContextualIdentity> = {
  cookieStoreId: '3',
  name: '',
  color: 'green'
}

describe('loads containers', () => {
  beforeEach(() => {
    vi.mock('webextension-polyfill', () => ({
      default: {
        contextualIdentities: {
          query: () => Promise.resolve([c1, c2, c3])
        }
      }
    }))
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('loads tab containers', async () => {
    const containers = await loadContainers()

    expect(containers).toEqual([
      { cookieStoreId: NO_CONTAINER_ID, title: NO_CONTAINER_TITLE },
      { cookieStoreId: NEW_CONTAINER_ID, title: NEW_CONTAINER_TITLE },
      { cookieStoreId: '1', title: 'Container 1 (red)' },
      { cookieStoreId: '2', title: 'Container 2 (blue)' },
      { cookieStoreId: '3', title: '(green)' }
    ])
  })
})
