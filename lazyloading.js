document.title = '[' + window.location.hash.substr(1).replace('http://', '').replace('https://', '') + ']';

// load site on focus
window.addEventListener('focus', function(event) { 
	window.location = window.location.hash.substr(1);
}, false);