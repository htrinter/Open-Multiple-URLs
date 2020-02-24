document.addEventListener('DOMContentLoaded', init);

let cacheKey = 'open-mul-url-cache';
let txtArea = document.getElementById('urls');
let lazyLoadCheckbox = document.getElementById('lazyLoad');
let randomCheckbox = document.getElementById('random');
let newWindowCheckbox = document.getElementById('newWindow');
let urlFromTextCheckbox = document.getElementById('urlFromText');

function init() {
  let oldOpts = getCachedOpts(); // read cached options
  txtArea.value = oldOpts.txt;
  lazyLoadCheckbox.checked = oldOpts.lazyLoad;
  randomCheckbox.checked = oldOpts.random;
  newWindowCheckbox.checked = oldOpts.newWindow
  urlFromTextCheckbox.checked = oldOpts.urlFromText
  txtArea.select(); // select text in form field


  document.getElementById('open').addEventListener('click', loadSites);   // add event listener for button
  // listeners for options
  newWindowCheckbox.addEventListener("change", saveNewWindow);
  urlFromTextCheckbox.addEventListener("change", saveUrlFromText);
  // record on state change
  txtArea.addEventListener('change', (e) => {
    recordOpts({ txt: e.target.value });
  });
  lazyLoadCheckbox.addEventListener('change',() => {
    recordOpts({ lazyLoad: this.checked });
  });
  randomCheckbox.addEventListener('change', () => {
    recordOpts({ random: this.checked });
  });
  newWindowCheckbox.addEventListener('change', () => {
    recordOpts({ newWindow: this.checked });
  });
  urlFromTextCheckbox.addEventListener('change', () => {
    recordOpts({ urlFromText: this.checked });
  });
}
function getCachedOpts () { // get options from localStorage
  let cache = localStorage.getItem(cacheKey);
  if (cache) {
    return JSON.parse(cache);
  } else {
    return { txt: '', lazyLoad: false, random: false };
  }
}

function recordOpts (newOpt) { // record options into localStorage
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
// load sites in new background tabs
function loadSites(e) {
  let urlschemes = ['http', 'https', 'file', 'view-source', 'chrome-extension', 'about'];
  let urlfromtext = urlFromTextCheckbox.checked
  if (1 == 1) {
    let text = txtArea.value;
    var urls = [];
    let urlmatcharr;
    let urlregex = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/gi;
    while ((urlmatcharr = urlregex.exec(text)) !== null) {
      urls.push(urlmatcharr[0]);
    }
    
  } else {
    console.log("not chekced")
    let urls = txtArea.value.split(/\r\n?|\n/g);
  }
  urls.forEach(function(item, index, array) {
    console.log(item, index)
  })
  let lazyloading = lazyLoadCheckbox.checked;
  let random = randomCheckbox.checked;
  let innewwindow = newWindowCheckbox.checked

  if (random) {
    urls = shuffle(urls);
  }
  let cleanUrls = [];
  for (var i = 0, len = urls.length; i < len; i++) {
    if (urls[i] !== '' && urls[i].split(':')[0] !== 'chrome' && urls[i].split(':')[0] !== 'brave') {
      if (urlschemes.indexOf(urls[i].split(':')[0]) === -1 && !urlfromtext) {
        urls[i] = 'http://' + urls[i]; //http, not https, because compatability
      } // if is not url, make it an url
      urls[i] = urls[i].trim(); // remove whitespace
      cleanUrls.push(urls[i]);
    };
  }; // get legit urls

  if (lazyloading) {
    let compatibleUrls = [];
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
  browser.runtime.reload() // reload to sync options
}
