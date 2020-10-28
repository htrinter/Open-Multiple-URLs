import { extractURLs } from './extract';

test('extract urls', async () => {
  expect(extractURLs('https://test.de\nfoo\nhttp://example.com\nbar')).toBe(
    'https://test.de\nhttp://example.com\n'
  );
});
