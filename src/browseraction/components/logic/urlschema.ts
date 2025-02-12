export interface UrlSchemaConfig {
  schema: string
  canLazyLoad: boolean
}

export const SCHEMA_CONFIG: UrlSchemaConfig[] = [
  {
    schema: 'http',
    canLazyLoad: true
  },
  {
    schema: 'https',
    canLazyLoad: true
  },
  {
    schema: 'file',
    canLazyLoad: true
  },
  {
    schema: 'view-source',
    canLazyLoad: true
  },
  {
    schema: 'moz-extension',
    canLazyLoad: false
  },
  {
    schema: 'chrome',
    canLazyLoad: false
  },
  {
    schema: 'chrome-extension',
    canLazyLoad: false
  },
  { schema: 'edge', canLazyLoad: false },
  {
    schema: 'extension',
    canLazyLoad: false
  }
]

export const getSchema = (url: string): string => {
  return url.split(':')[0]
}

export const getSchemaConfig = (url: string): UrlSchemaConfig | undefined => {
  return SCHEMA_CONFIG.find((schemaConfig) => schemaConfig.schema === getSchema(url))
}
