import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  loadTabGroups,
  NEW_TAB_GROUP_ID,
  NO_TAB_GROUP_ID
} from '@/browseraction/components/logic/tabgroups'
import { beforeEach } from 'node:test'

const tg1 = { id: 1, title: 'Group 1', color: 'red' }
const tg2 = { id: 2, title: 'Group 2', color: 'blue' }

describe('loads tab groups', () => {
  beforeEach(() => {
    vi.mock('webextension-polyfill', () => ({
      default: {
        tabGroups: {
          query: () => Promise.resolve([tg1, tg2])
        }
      }
    }))
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('loads tab groups', async () => {
    const tabGroups = await loadTabGroups()

    expect(tabGroups).toEqual([
      { id: NO_TAB_GROUP_ID, title: 'No Tab Group' },
      { id: NEW_TAB_GROUP_ID, title: 'New Tab Group' },
      { id: 1, title: 'Group 1 (red)' },
      { id: 2, title: 'Group 2 (blue)' }
    ])
  })
})
