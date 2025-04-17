import browser from 'webextension-polyfill'
import type { LoadSitesMessage } from './types'
import { loadSites } from '../browseraction/components/logic/load'

// Listen for messages from the popup
export const loadSitesListener = async (message: any) => {
  if (message.action === 'loadSites') {
    const loadSitesMessage = message as LoadSitesMessage
    return loadSites(
      loadSitesMessage.text,
      loadSitesMessage.lazyloading,
      loadSitesMessage.random,
      loadSitesMessage.reverse,
      loadSitesMessage.deduplicate,
      loadSitesMessage.handleAsSearchQuery,
      loadSitesMessage.selectedTabGroupId,
      loadSitesMessage.selectedContainerId
    )
  }
  return false
}
browser.runtime.onMessage.addListener(loadSitesListener)
