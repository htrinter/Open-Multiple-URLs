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

export const NO_CONTAINER_ID = String('NO_CONTAINER_ID')
export const NEW_CONTAINER_ID = String('NEW_CONTAINER_ID')

export const loadContainers = async (): Promise<Container[]> => {
  const containers = await (browser.contextualIdentities?.query({}) || Promise.resolve([]))
  return [
    { cookieStoreId: NO_CONTAINER_ID, title: 'No Container' },
    { cookieStoreId: NEW_CONTAINER_ID, title: 'New Container' },
    ...containers.map((ci) => ({
      cookieStoreId: ci.cookieStoreId,
      title: `${ci.name}${ci.name ? ' ' : ''}(${ci.color})`
    }))
  ]
}
