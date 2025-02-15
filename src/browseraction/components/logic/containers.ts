import browser from 'webextension-polyfill'

export interface Container {
  cookieStoreId: string
  title: string
}

export const CONTAINER_COLORS = [
  'blue',
  'turquoise',
  'green',
  'yellow',
  'orange',
  'red',
  'pink',
  'purple'
]

export const NO_CONTAINER_ID = 'NO_CONTAINER_ID'
export const NO_CONTAINER_TITLE = 'No Container'
export const NEW_CONTAINER_ID = 'NEW_CONTAINER_ID'
export const NEW_CONTAINER_TITLE = 'New Container'

export const loadContainers = async (): Promise<Container[]> => {
  const containers = await (browser.contextualIdentities?.query({}) || Promise.resolve([]))
  return [
    { cookieStoreId: NO_CONTAINER_ID, title: NO_CONTAINER_TITLE },
    { cookieStoreId: NEW_CONTAINER_ID, title: NEW_CONTAINER_TITLE },
    ...containers.map((ci) => ({
      cookieStoreId: ci.cookieStoreId,
      title: `${ci.name}${ci.name ? ' ' : ''}(${ci.color})`
    }))
  ]
}
