import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  loadTabGroups,
  NEW_TAB_GROUP_ID,
  NEW_TAB_GROUP_TITLE,
  NO_TAB_GROUP_ID,
  NO_TAB_GROUP_TITLE
} from '@/browseraction/components/logic/tabgroups'
import browser from 'webextension-polyfill'
import { beforeEach } from 'node:test'

const tg1: Partial<browser.TabGroups.TabGroup> = { id: 1, title: 'Group 1', color: 'red' }
const tg2: Partial<browser.TabGroups.TabGroup> = { id: 2, title: 'Group 2', color: 'blue' }
const tg3: Partial<browser.TabGroups.TabGroup> = { id: 3, title: '', color: 'green' }

describe('loads tab groups', () => {
  beforeEach(() => {
    vi.mock('webextension-polyfill', () => ({
      default: {
        tabGroups: {
          query: () => Promise.resolve([tg1, tg2, tg3])
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
      { id: NO_TAB_GROUP_ID, title: NO_TAB_GROUP_TITLE },
      { id: NEW_TAB_GROUP_ID, title: NEW_TAB_GROUP_TITLE },
      { id: 1, title: 'Group 1 (red)' },
      { id: 2, title: 'Group 2 (blue)' },
      { id: 3, title: '(green)' }
    ])
  })
})
