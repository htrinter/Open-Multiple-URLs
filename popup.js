document.addEventListener('DOMContentLoaded', init);

let cacheKey = 'open-mul-url-cache';
let txtArea = document.getElementById('urls');
let lazyLoadCheckbox = document.getElementById('lazyLoad');
let randomCheckbox = document.getElementById('random');
let newWindowCheckbox = document.getElementById('newWindow');
let urlFromTextCheckbox = document.getElementById('urlFromText');
// Save options to sync, when changed
function saveLazyLoad(e) {
  e.preventDefault();
  browser.storage.sync.set({
      lazyLoad: lazyLoadCheckbox.checked
  });
  browser.runtime.reload()
}
function saveRandom(e) {
  e.preventDefault();
  browser.storage.sync.set({
      random: randomCheckbox.checked
  });
  browser.runtime.reload()
}
function saveNewWindow(e) {
  e.preventDefault();
  browser.storage.sync.set({
      saveNewWindow: newWindowCheckbox.checked
  });
  browser.runtime.reload()
}
function saveUrlFromText(e) {
  e.preventDefault();
  browser.storage.sync.set({
      urlFromText: urlFromTextCheckbox.checked
  });
  browser.runtime.reload()
}
// Get options from sync on load
function restoreOptions() {
  function setLazyLoad(result) {
      lazyLoad.checked = result.lazyLoad || "true";
  }
  function setRandom(result) {
    random.checked = result.random || "false";
  }
  function setNewWindow(result) {
    newWindow.checked = result.newWindow || "false";
  }
  function setUrlFromText(result) {
    urlFromText.checked = result.urlFromText || "false";
  }

  function onError(error) {
      console.log(`Error: ${error}`);
  }
  let gettingLazyLoad = browser.storage.sync.get("lazyLoad");
  let gettingRandom = browser.storage.sync.get("random");
  let gettingNewWindow = browser.storage.sync.get("newWindow");
  let gettingUrlFromText = browser.storage.sync.get("urlFromText");
  gettingLazyLoad.then(setLazyLoad, onError);
  gettingRandom.then(setRandom, onError);
  gettingNewWindow.then(setNewWindow, onError);
  gettingUrlFromText.then(setUrlFromText, onError);
}

function init() {
  txtArea.select(); // select text in form field
  restoreOptions // restore options
  document.getElementById('open').addEventListener('click', loadSites);   // add event listener for buttons
  // listeners for options
  lazyLoadCheckbox.addEventListener("change", saveLazyLoad);
  randomCheckbox.addEventListener("change", saveRandom);
  newWindowCheckbox.addEventListener("change", saveNewWindow);
  urlFromTextCheckbox.addEventListener("change", saveUrlFromText);
}

// get options from localStorage
function getCachedOpts() {
  let cache = localStorage.getItem(cacheKey);
  if (cache) {
    return JSON.parse(cache);
  } else {
    return { txt: '', lazyLoad: false, random: false, newWindow: false, urlFromText: false };
  }
}

// record options into localStorage
function recordOpts(newOpt) {
  let oldOpt = getCachedOpts();
  localStorage.setItem(
    cacheKey,
    JSON.stringify(Object.assign({}, oldOpt, newOpt))
  );
}

/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
  let j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}
// extract urls from text
function extractURLs(e) {
  let text = txtArea.value;

  let urls = '';
  let urlmatcharr;
  let urlregex = "(http|ftp|https)://([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?"
  while ((urlmatcharr = urlregex.exec(text)) !== null) {
    let match = urlmatcharr[0];
    urls += match + '\n';
  }

  txtArea.value = urls;
  recordOpts({ txt: urls });
}

// load sites in new background tabs
function loadSites(e) {
  let urlschemes = ['http', 'https', 'file', 'view-source', 'chrome-extension', 'about'];
  let urlfromtext = urlFromTextCheckbox.checked
  if (urlfromtext) {
    extractURLs
  }
  let urls = txtArea.value.split(/\r\n?|\n/g);
  let lazyloading = lazyLoadCheckbox.checked;
  let random = randomCheckbox.checked;
  let innewwindow = newWindowCheckbox.checked

  if (random) {
    urls = shuffle(urls);
  }
  var cleanUrls = []
  for (var i = 0, len = urls.length; i < len; i++) {
    if (urls[i] !== '' && urls[i].split(':')[0] !== 'chrome' && urls[i].split(':')[0] !== 'brave') {
      if (urlschemes.indexOf(urls[i].split(':')[0]) === -1) {
        urls[i] = 'http://' + urls[i]; //http, not https, because compatability
      } // if is not url, make it an url
      urls[i] = urls[i].trim(); // remove whitespace
      cleanUrls.push(urls[i]);
    };
  }; // get legit urls
  
  if (lazyloading) {
    var compatibleUrls = [];
    for (var i = 0, len = cleanUrls.length; i < len; i++) {
      if (cleanUrls[i].split(':')[0] !== 'file' && cleanUrls[i].split(':')[0] !== 'file') {
        compatibleUrls.push(urls[i]);
      };
    }; // remove urls not compatible with lazyloader
    let lazyurls = []
    compatibleUrls.map(function (a) {
      lazyurls.push(
        chrome.extension.getURL('lazyloading.html#') + a)
    }); // pre-append lazyloading to all urls
    if (innewwindow) {
      chrome.windows.create({
        url: lazyurls
      }) // launch urls in new window 
    } else {
      for (let i = 0; i < urls.length; i++) {
        let theurl = lazyurls[i] // get current url
        chrome.tabs.create({
          url: theurl,
          active: false
        }); // tabs go one by one
      }
    }
  } else { // do not lazyload
    if (innewwindow) {
      chrome.windows.create({
        url: cleanUrls
      }); // in new window
    } else {
      for (let i = 0; i < urls.length; i++) {
        let theurl = cleanUrls[i] // get current url
        chrome.tabs.create({
          url: theurl,
          active: false
        }); // tabs go one by one
      }
    }
  }
}
