import browser from 'webextension-polyfill'

/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
const shuffle = (a: string[]) => {
  let j, x, i
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1))
    x = a[i]
    a[i] = a[j]
    a[j] = x
  }
  return a
}

export const URL_LINE_SPLIT_REGEX = /\r\n?|\n/g
/**
 * Loads sites in new background tabs
 * @param text Text containing one URL per line
 * @param lazyloading Lazy-load tabs
 * @param random Open tabs in random order
 * @param reverse Open tabs in reverse order
 */
export const loadSites = (
  text: string,
  lazyloading: boolean,
  random: boolean,
  reverse: boolean
): void => {
  const urlschemes = ['http', 'https', 'file', 'view-source']
  let urls = text.split(URL_LINE_SPLIT_REGEX)

  if (reverse) {
    urls = urls.reverse()
  }

  if (random) {
    urls = shuffle(urls)
  }

  for (let i = 0; i < urls.length; i++) {
    let theurl = urls[i].trim()
    if (theurl !== '') {
      if (urlschemes.indexOf(theurl.split(':')[0]) === -1) {
        theurl = 'http://' + theurl
      }
      if (
        lazyloading &&
        theurl.split(':')[0] !== 'view-source' &&
        theurl.split(':')[0] !== 'file'
      ) {
        browser.tabs.create({
          url: browser.runtime.getURL('lazyloading.html#') + theurl,
          active: false
        })
      } else {
        browser.tabs.create({
          url: theurl,
          active: false
        })
      }
    }
  }
}

export const getTabCount = (text: string) => {
  let tabCount = '0'
  if (text) {
    const lines = text.split(URL_LINE_SPLIT_REGEX)
    if (lines.length <= 5000) {
      // limit for performance reasons
      tabCount = String(lines.filter((line: string) => line.trim() !== '').length)
    } else {
      tabCount = '> 5000'
    }
  }
  return tabCount
}
