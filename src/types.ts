/**
 * Type definition for message passing between popup and background script
 */

export interface LoadSitesMessage {
  action: 'loadSites'
  text: string
  lazyloading: boolean
  random: boolean
  reverse: boolean
  deduplicate: boolean
  handleAsSearchQuery: boolean
  selectedTabGroupId: number | null | undefined
  selectedContainerId: string | null | undefined
}