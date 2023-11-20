import { expect, it } from 'vitest'
import { extractURLs } from '@/browseraction/components/logic/extract'

it('extract urls', async () => {
  expect(extractURLs('https://test.de\nfoo\nhttp://example.com\nbar')).toBe(
    'https://test.de\nhttp://example.com\n'
  )
})
