import browser from 'webextension-polyfill'

export interface TabGroup {
  id: number
  title: string
}

export const NO_TAB_GROUP_ID = -1
export const NEW_TAB_GROUP_ID = -2

export const loadTabGroups = async (): Promise<TabGroup[]> => {
  const tabGroups = await (browser.tabGroups?.query({}) || Promise.resolve([]))
  return [
    { id: NO_TAB_GROUP_ID, title: 'No Tab Group' },
    { id: NEW_TAB_GROUP_ID, title: 'New Tab Group' },
    ...tabGroups.map((group) => ({
      id: group.id,
      title: `${group.title}${group.title ? ' ' : ''}(${group.color})`
    }))
  ]
}
