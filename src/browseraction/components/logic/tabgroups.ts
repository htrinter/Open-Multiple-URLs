import browser from 'webextension-polyfill'

export interface TabGroup {
  id: number
  title: string
}

export const NO_TAB_GROUP_ID = -1
export const NO_TAB_GROUP_TITLE = 'No Tab Group'
export const NEW_TAB_GROUP_ID = -2
export const NEW_TAB_GROUP_TITLE = 'New Tab Group'

export const loadTabGroups = async (): Promise<TabGroup[]> => {
  const tabGroups = await (browser.tabGroups?.query({}) || Promise.resolve([]))
  return [
    { id: NO_TAB_GROUP_ID, title: NO_TAB_GROUP_TITLE },
    { id: NEW_TAB_GROUP_ID, title: NEW_TAB_GROUP_TITLE },
    ...tabGroups.map((group) => ({
      id: group.id,
      title: `${group.title}${group.title ? ' ' : ''}(${group.color})`
    }))
  ]
}
