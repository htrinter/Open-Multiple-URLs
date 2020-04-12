let browserApi;
try {
  browserApi = browser;
} catch (e) {
  if (e instanceof ReferenceError) {
      console.log('switch to chrome api');
      browserApi = chrome;
  } else {
    throw(e);
  }
}

document.addEventListener('DOMContentLoaded', init);

let txtArea = document.getElementById('urls');
let lazyLoadCheckbox = document.getElementById('lazyLoad');
let randomCheckbox = document.getElementById('random');

async function init () {
  // migrate from deprecated storage
  let deprecatedStorageKey = 'open-mul-url-cache';
  let oldOptionsVal = localStorage.getItem(deprecatedStorageKey);
  if (oldOptionsVal) {
    console.log('old options found: ' + oldOptionsVal);
    let oldOptions = JSON.parse(oldOptionsVal);
    if (oldOptions.txt != undefined) {
      await browserApi.storage.local.set({ 'txt' : oldOptions.txt });
    }
    if (oldOptions.lazyLoad != undefined) {
      await browserApi.storage.local.set({ 'lazyload' : oldOptions.lazyLoad });
    }
    if (oldOptions.random != undefined) {
      await browserApi.storage.local.set({ 'random' : oldOptions.random });
    }
    localStorage.removeItem(deprecatedStorageKey);
  }

  // restore options
  browserApi.storage.local.get('txt', data => {
    if (data != undefined && data.txt != undefined) {
      txtArea.value = data.txt;
    }
  });
  browserApi.storage.local.get('lazyload', data => {
    if (data != undefined && data.lazyload != undefined) {
      lazyLoadCheckbox.checked = data.lazyload;
    }
  });
  browserApi.storage.local.get('random', data => {
    if (data != undefined && data.random != undefined ) {
      randomCheckbox.checked = data.random;
    }
  });

  // add event listener for buttons
  document.getElementById('open').addEventListener('click', loadSites);
  document.getElementById('extract').addEventListener('click', extractURLs);

  // record on state change
  txtArea.addEventListener('change', event => {
    browserApi.storage.local.set({ txt : event.target.value });
  });
  lazyLoadCheckbox.addEventListener('change', event => {
    browserApi.storage.local.set({ lazyload : event.target.checked });
  });
  randomCheckbox.addEventListener('change', event => {
    browserApi.storage.local.set({ random : event.target.checked });
  });

  // select text in form field
  txtArea.select();
}

/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle (a) {
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
function loadSites (e) {
  let urlschemes = ['http', 'https', 'file', 'view-source'];
  let urls = txtArea.value.split(/\r\n?|\n/g);
  let lazyloading = lazyLoadCheckbox.checked;
  let random = randomCheckbox.checked;

  if (random) {
    urls = shuffle(urls);
  }

  for (let i = 0; i < urls.length; i++) {
    let theurl = urls[i].trim();
    if (theurl !== '') {
      if (urlschemes.indexOf(theurl.split(':')[0]) === -1) {
        theurl = 'http://' + theurl;
      }
      if (
        lazyloading &&
        theurl.split(':')[0] !== 'view-source' &&
        theurl.split(':')[0] !== 'file'
      ) {
        browserApi.tabs.create({
          url: browserApi.extension.getURL('lazyloading.html#') + theurl,
          active: false
        });
      } else {
        browserApi.tabs.create({
          url: theurl,
          active: false
        });
      }
    }
  }
}

// extract urls from text
function extractURLs (e) {
  let text = txtArea.value;

  let urls = '';
  let urlmatcharr;
  let urlregex = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/gi;
  while ((urlmatcharr = urlregex.exec(text)) !== null) {
    let match = urlmatcharr[0];
    urls += match + '\n';
  }

  txtArea.value = urls;
}
