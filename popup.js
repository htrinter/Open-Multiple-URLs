document.addEventListener('DOMContentLoaded', function () {
  // read stored opts
  var oldOpts = getCachedOpts()
  var txtArea = document.getElementById('urls')
  txtArea.value = oldOpts.txt

  var lazyLoadCheckbox = document.getElementById('lazyLoad')
  lazyLoadCheckbox.checked = oldOpts.lazyLoad

  // add event listener for buttons
  document.getElementById('open').addEventListener('click', loadSites)
  document.getElementById('extract').addEventListener('click', extractURLs)
  txtArea.addEventListener('change', function (e) {
    recordOpts({ txt: e.target.value })
  })
  lazyLoadCheckbox.addEventListener('change', function () {
    recordOpts({ lazyLoad: this.checked })
  })

  // focus on form field
  txtArea.focus()
})

var cacheKey = 'open-mul-url-cache'

function getCachedOpts () {
  let cache = localStorage.getItem(cacheKey)
  if (cache) {
    return JSON.parse(cache)
  } else {
    return { txt: '', lazyLoad: false }
  }
}

function recordOpts (newOpt) {
  var oldOpt = getCachedOpts()
  localStorage.setItem(
    cacheKey,
    JSON.stringify(Object.assign({}, oldOpt, newOpt))
  )
}

// load sites in new background tabs
function loadSites (e) {
  var urlschemes = ['http', 'https', 'file', 'view-source']
  var urls = document.getElementById('urls').value.split('\n')
  var lazyloading = document.getElementsByName('lazyloading')[0].checked

  for (var i = 0; i < urls.length; i++) {
    theurl = urls[i].trim()
    if (theurl != '') {
      if (urlschemes.indexOf(theurl.split(':')[0]) == -1) {
        theurl = 'http://' + theurl
      }
      if (
        lazyloading &&
        theurl.split(':')[0] != 'view-source' &&
        theurl.split(':')[0] != 'file'
      ) {
        chrome.tabs.create({
          url: chrome.extension.getURL('lazyloading.html#') + theurl,
          selected: false
        })
      } else {
        chrome.tabs.create({ url: theurl, selected: false })
      }
    }
  }
}

// extract urls from text
function extractURLs (e) {
  var text = document.getElementById('urls').value

  var urls = ''
  var urlmatcharr
  var urlregex = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/gi
  while ((urlmatcharr = urlregex.exec(text)) !== null) {
    var match = urlmatcharr[0]
    urls += match + '\n'
  }

  document.getElementById('urls').value = urls
}
