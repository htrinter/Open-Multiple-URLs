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

export const hasContainerSupport = async (): Promise<boolean> => {
  if (!browser.contextualIdentities) {
    return false
  } else {
    // probe if containers are deactivated
    try {
      await browser.contextualIdentities.query({})
      return true
    } catch (e) {
      console.info('Error querying containers, the browser feature may be disabled:', e)
      return false
    }
  }
}

export const loadContainers = async (): Promise<Container[]> => {
  const containers: Container[] = (await hasContainerSupport())
    ? (await (browser.contextualIdentities?.query({}) || Promise.resolve([]))).map((ci) => ({
        cookieStoreId: ci.cookieStoreId,
        title: `${ci.name}${ci.name ? ' ' : ''}(${ci.color})`
      }))
    : []

  return [
    { cookieStoreId: NO_CONTAINER_ID, title: NO_CONTAINER_TITLE },
    { cookieStoreId: NEW_CONTAINER_ID, title: NEW_CONTAINER_TITLE },
    ...containers
  ]
}
