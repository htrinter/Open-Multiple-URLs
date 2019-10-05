document.addEventListener('DOMContentLoaded', init);

let cacheKey = 'open-mul-url-cache';
let txtArea = document.getElementById('urls');
let lazyLoadCheckbox = document.getElementById('lazyLoad');
let randomCheckbox = document.getElementById('random');

function init () {
  // read cached opts
  let oldOpts = getCachedOpts();
  txtArea.value = oldOpts.txt;
  lazyLoadCheckbox.checked = oldOpts.lazyLoad;
  randomCheckbox.checked = oldOpts.random;

  // add event listener for buttons
  document.getElementById('open').addEventListener('click', loadSites);
  document.getElementById('extract').addEventListener('click', extractURLs);

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

  // select text in form field
  txtArea.select();
}

// get options from localStorage
function getCachedOpts () {
  let cache = localStorage.getItem(cacheKey);
  if (cache) {
    return JSON.parse(cache);
  } else {
    return { txt: '', lazyLoad: false, random: false };
  }
}

// record options into localStorage
function recordOpts (newOpt) {
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
        chrome.tabs.create({
          url: chrome.extension.getURL('lazyloading.html#') + theurl,
          active: false
        });
      } else {
        chrome.tabs.create({
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
  recordOpts({ txt: urls });
}
