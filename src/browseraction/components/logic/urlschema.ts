// The following schemas cannot be lazy loaded because of browser restrictions
export const NO_LAZY_LOAD_SCHEMES = [
  'file',
  'view-source',
  'moz-extension',
  'chrome',
  'chrome-extension',
  'edge',
  'extension'
]

export const getSchema = (url: string): string => {
  return hasValidSchema(url) ? new URL(url).protocol.replace(':', '') : ''
}

export const hasValidSchema = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch (e) {
    return false
  }
}

export const canLazyLoad = (url: string): boolean => {
  return NO_LAZY_LOAD_SCHEMES.indexOf(getSchema(url)) === -1
}
