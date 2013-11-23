/**
 * WaniKani API utilities, for use within userscripts.
 * Just place this script in the @require section of the userscript header.
 */
window.WaniKaniAPI = (function() {
  // Common key to use for the API key.
  var API_RETREIVAL_KEY = 'jeshuam-wanikani-apikey';

  var WaniKaniAPI = {
    /**
     * Get the API key from storage and return it. If it doesn't exist, return null.
     */
    getAPIKey: function() {
      return GM_getValue(API_RETREIVAL_KEY);
    },

    /**
     * Insert the API key into storage. If you are deleting, rather use deleteAPIKey().
     */
    setAPIKey: function(apiKey) {
      GM_setValue(API_RETREIVAL_KEY, apiKey);
    },

    /**
     * Remove the API key from storage.
     */
    deleteAPIKey: function() {
      GM_deleteValue(API_RETREIVAL_KEY);
    },

    /**
     * Get the API key from the DOM. Will only do something if the user is on the
     * /account page.
     */
    setAPIKeyFromDOM: function() {
      if (window.location.href.indexOf('account') >= 0) {
        // Make sure the API key isn't already there.
        if (WaniKaniAPI.getAPIKey()) {
          return;
        }

        // Required function because the API key has no ID on it. :(
        function getAPIKeyFromDom() {
          // Look through all .span6's for the API key. We can identify the API key by the
          // placeholder text.
          var elementsToSearch = document.querySelectorAll('.span6');
          for (var i in elementsToSearch) {
            var element = elementsToSearch[i];
            if (element.placeholder === 'Key has not been generated') {
              return element.value;
            }
          }

          // Couldn't find it :(
          return null;
        }

        // Find the API key.
        WaniKaniAPI.setAPIKey(getAPIKeyFromDom());
        alert('JeshuaM Scripts: API Key Saved! ' + WaniKaniAPI.getAPIKey());
      }
    },

    /**
     * Make an AJAX request to the given API url, and call `callback` when finished.
     */
    call: function(url, callback) {
      var xhr;

      // Get the XHR element first.
      if (typeof XMLHttpRequest !== 'undefined') {
        xhr = new XMLHttpRequest();
      } else {
        var versions = ["MSXML2.XmlHttp.5.0",
                        "MSXML2.XmlHttp.4.0",
                        "MSXML2.XmlHttp.3.0",
                        "MSXML2.XmlHttp.2.0",
                        "Microsoft.XmlHttp"]

        for(var i = 0, len = versions.length; i < len; i++) {
          try {
            xhr = new ActiveXObject(versions[i]);
            break;  
          } catch(e) {

          }
        }
      }

      // Function to execute when the state of the XHR request changes.
      xhr.onreadystatechange = function() {
        if(xhr.readyState < 4) {
          return;
        }

        if(xhr.status !== 200) {
          return;
        }

        if(xhr.readyState === 4) {
          callback(xhr);
        }
      };

      // Start the request.
      xhr.open('GET', url, true);
      xhr.send('');
    }
  };

  // Register some GreaseMonkey commands.
  GM_registerMenuCommand('JeshuaM Scripts: Change API Key', function() {
    var apiKey = prompt('Please enter your API key.', WaniKaniAPI.getAPIKey() || '');
    if (apiKey != null) {
      setAPIKey(apiKey);
      alert('JeshuaM Scripts: API Key Saved! ' + apiKey);
    }
  })

  GM_registerMenuCommand('JeshuaM Scripts: Reset API Key', function() {
    WaniKaniAPI.deleteAPIKey();
    alert('JeshuaM Scripts: API Key Deleted!');
  });
})();
