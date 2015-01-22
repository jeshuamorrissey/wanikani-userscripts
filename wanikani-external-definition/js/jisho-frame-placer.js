// Injects some JS into the page.
function injectJS(scriptName) {
	var s = document.createElement('script');
	s.type = 'text/javascript';
	s.src = chrome.extension.getURL(scriptName + '.js');
	s.onload = function() {
	  this.parentNode.removeChild(this);
	};
    
	(document.head || document.documentElement).appendChild(s);
}

// We need to do this so that the frame placer has access to jQuery and jStorage.
injectJS('js/jisho-frame-placer-src');
