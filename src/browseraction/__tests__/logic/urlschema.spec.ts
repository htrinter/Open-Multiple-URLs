import { describe, it, expect } from 'vitest'
import { getSchema, hasValidSchema, canLazyLoad } from '../../components/logic/urlschema'

describe('urlschema', () => {
  describe('getSchema', () => {
    it.each([
      { url: 'https://example.com', expected: 'https' },
      { url: 'http://example.com', expected: 'http' },
      { url: 'file:///example.txt', expected: 'file' },
      { url: 'invalid-url', expected: '' },
      { url: '//invalid-url', expected: '' }
    ])('should return $expected for $url', ({ url, expected }) => {
      expect(getSchema(url)).toBe(expected)
    })
  })

  describe('hasValidSchema', () => {
    it.each([
      { url: 'https://example.com', expected: true },
      { url: 'http://example.com', expected: true },
      { url: 'file:///example.txt', expected: true },
      { url: 'invalid-url', expected: false },
      { url: '//invalid-url', expected: false }
    ])('should return $expected for $url', ({ url, expected }) => {
      expect(hasValidSchema(url)).toBe(expected)
    })
  })

  describe('canLazyLoad', () => {
    it.each([
      { url: 'file:///example.txt', expected: false },
      { url: 'chrome://settings', expected: false },
      { url: 'moz-extension://example', expected: false },
      { url: 'https://example.com', expected: true },
      { url: 'http://example.com', expected: true }
    ])('should return $expected for $url', ({ url, expected }) => {
      expect(canLazyLoad(url)).toBe(expected)
    })
  })
})
