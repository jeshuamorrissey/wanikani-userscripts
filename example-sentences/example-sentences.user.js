// ==UserScript==
// @name WaniKani Example Sentences
// @version 2.1
// @description  Displays additional examples sentences for the given vocabulary.
// @match https://www.wanikani.com/settings/account
// @match *://www.wanikani.com/*vocabulary/*
// @match *://www.wanikani.com/review/session*
// @match *://www.wanikani.com/lesson/session*
// @run-at          document-end
// @copyright 2017 jeshuam
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_registerMenuCommand
// ==/UserScript==

/**
 * WaniKani API utilities, for use within userscripts.
 * Just place this script in the @require section of the userscript header.
 */
(function() {
  // Common key to use for the API key.
  var API_RETREIVAL_KEY = 'jeshuam-wanikani-apikey';

  var WaniKaniAPI = window.WaniKaniAPI = {
    /**
     * Get the API key from storage and return it. If it doesn't exist, return null.
     */
    getAPIKey: function() {
      let key = GM_getValue(API_RETREIVAL_KEY, '');
      if (key === '') {
        // If we are on the account page, populate the API key (and maybe move back
        // to where we were before).
        if (window.location.href.indexOf('settings/account') >= 0) {
          key = document.querySelector('#user_api_key').value;
          WaniKaniAPI.setAPIKey(key);

          // From http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
          function getParameterByName(name) {
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
            var results = regex.exec(location.search);
            return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
          }

          // Notify the user, then redirect if necessary.
          var redirect = getParameterByName('prev');
          if (redirect) {
            window.alert('API key set to ' + key + '! Going back to '  + redirect);
            window.location.href = redirect;
          } else {
            window.alert('API key set to ' + key + '!');
          }
        } else {
          if (window.confirm('Moving to settings page to fetch API key!')) {
            window.location.href = '/settings/account?prev=' + window.location.href;
          }

          return null;
        }
      }

      return key;
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
              return element.value.trim();
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
     * Get the API base URL.
     */
    apiURL: function(action) {
      return 'https://www.wanikani.com/api/v1.2/user/' + WaniKaniAPI.getAPIKey() + '/' + action;
    },

    /**
     * Make an AJAX request to the given API url, and call `callback` when finished.
     */
    load: function(url, callback) {
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
      WaniKaniAPI.setAPIKey(apiKey);
      alert('JeshuaM Scripts: API Key Saved! ' + apiKey);
    }
  });

  GM_registerMenuCommand('JeshuaM Scripts: Reset API Key', function() {
    WaniKaniAPI.deleteAPIKey();
    alert('JeshuaM Scripts: API Key Deleted!');
  });
})();

function LOG(msg) {
  console.log('EXAMPLE-SENTENCES:', msg);
}

function DisplayExampleSentences(LEARNED_VOCABULARY) {
    // Add the CSS to the page.
    $('head').append('<style>' + CSS + '</style>');
    
    //
    // Given a jQuery container, activate all tooltips within the container.
    //
    function ActivateTooltips(container) {
        if (container && container.tooltip) {
           container.find('span[rel="tooltip"]').tooltip();
        }
    }
 
    //
    // Extract the Kanji from the current page. This will have a switch for each type of page, and
    // will do something different for each. This will only include vocabulary pages, reviews and
    // lessons.
    //
    function GetVocabularyKanjiFromPage() {
        // Vocabulary information page.
        if (url.indexOf('vocabulary') != -1) {
            return $('header span.vocabulary-icon span').text().trim();
        }
 
        // Review page.
        else if (url.indexOf('review/session') != -1) {
            return $.jStorage.get('currentItem').voc;
        }
 
        // Lesson page.
        else if (url.indexOf('lesson/session') != -1) {
            return $.jStorage.get('l/currentLesson').voc;
        }
 
        // Not on a valid page.
        else {
            return null;
        }
    }
 
    //
    // Extract the kana from the current page. This will have a switch for each type of page, and
    // will do something different for each. This will only include vocabulary pages, reviews and
    // lessons.
    //
    function GetVocabularyKanaFromPage() {
        // Vocabulary information page.
        if (url.indexOf('vocabulary') != -1) {
            return $('section.vocabulary-reading p').text().trim();
        }
 
        // Review page.
        else if (url.indexOf('review/session') != -1) {
            return $.jStorage.get('currentItem').kana[0];
        }
 
        // Lesson page.
        else if (url.indexOf('lesson/session') != -1) {
            return $.jStorage.get('l/currentLesson').kana[0];
        }
 
        // Not on a valid page.
        else {
            return null;
        }
    }
 
    //
    // Get the data from the remote URL for the given vocabulary.
    //
    function GetExampleSentencesForVocabulary(vocabulary, complete) {
        $('section#example-sentences-section').detach();
        $.get('https://jeshuam.pythonanywhere.com/wanikani-sentences/' + vocabulary, complete);
    }
 
    function GetSectionWithExamplesSentences(data) {
        // Build the basic sentence structure.
        var section = $('<section id="example-sentences-section" />')
            .append('<h2>Example Sentences</h2>')
            .append('<div id="example-sentences"><div></div></div>');
 
        return section;
    }
 
    function SetupPaginationOnSectionWithSentenceData(section, data) {
        // Setup pagination on the section.
        var NUMBER_OF_ITEMS_PER_PAGE = 3;
 
        // Filter the data so that only sentences with all known vocab are displayed.
        if (LEARNED_VOCABULARY != null) {
            data = jQuery.grep(data, function(sentence, _) {
                var valid = true;
                $.each(sentence.jpn, function(_, japaneseWord) {
                    if (LEARNED_VOCABULARY[japaneseWord] == undefined && !OnlyContainsKanaOrPunctuation(japaneseWord)) {
                        valid = false;
                        return false;
                    }
                });
 
                return valid;
            });
        }
 
        //
        // Function to check whether a Japanese word only contains kana (hira- or katakana).
        //
        function OnlyContainsKanaOrPunctuation(japaneseWord) {
            return japaneseWord.match(/^[\u3000-\u30FF]+$/) != null;
        }
 
        //
        // Display the given page within the div.
        //
        function DisplaySamplesSentencesPage(pageNumber, div) {
            div.find('ol').detach();
 
            // Extrac the vocab and kana from the page.
            var kanji = GetVocabularyKanjiFromPage();
            var kana = GetVocabularyKanaFromPage();
 
            // Slice out the data items we are interested in. This is assuming
            // that `pageNumber` is indexed from 1.
            var pageData = div.data('sentences').slice(
                (pageNumber - 1) * NUMBER_OF_ITEMS_PER_PAGE,
                (pageNumber * NUMBER_OF_ITEMS_PER_PAGE));
 
            // Replace all sentences with the next page.
            div.find('div').last().before('<ol>');
            $.each(pageData, function(_, sentence) {
                // If we are up to a filler, just add the space.
                if (sentence == null) {
                    div.find('ol').append('<li style="list-style-type: none; margin-left: -20px"><p>&nbsp;</p><div style="margin: -5px 10px">&nbsp;</div></li>');
                    return;
                }
 
                // Pre-process the sentence.
                var japaneseText = '';
                $.each(sentence.jpn, function(_, japaneseWord) {
                    // Highlight the current word.
                    if (japaneseWord == kanji) {
                        japaneseText += '<span class="vocabulary-highlight highlight-vocabulary" rel="tooltip" data-original-title="' + kana + '">' + kanji + '</span>'
                    }
 
                    // Insert a link to the WaniKani page for learned vocabulary.
                    else if (LEARNED_VOCABULARY != null && LEARNED_VOCABULARY[japaneseWord] != undefined) {
                        japaneseText += '<span><a href="https://www.wanikani.com/vocabulary/' + LEARNED_VOCABULARY[japaneseWord] + '">' + japaneseWord + '</a></span>';
                    }
 
                    // Otherwise, just put the word into the text.
                    else {
                        japaneseText += '<span>' + japaneseWord + '</span>';
                    } 
                });
 
                if (!japaneseText) {
                    return;
                }
 
                var listEntry = $('<li style="list-style-type: none; margin-left: -20px"><p><span class="exploder">↨</span>' + japaneseText + '</p>' + '<div style="margin: -5px 10px">↳&nbsp;' + sentence.eng + '</div></li>');
                listEntry.find('span.exploder').click(function() {
                    $(this).parent().find('span').toggleClass('sentence-explode');
                });
                div.find('ol').append(listEntry);
            });
 
            // Activate the tooltips.
            ActivateTooltips(div);
        }
 
        // If the data doesn't contain the correct number of elements, pad it
        // with additional &nbsp;'s. This is apparently the modulo operator.
        // Seriously, fuck JavaScript.
        var n = NUMBER_OF_ITEMS_PER_PAGE;
        var padding = n - (data.length % n);
        if (padding == n) {
            padding = 0;
        }
 
        for (var i = 0; i < padding; i++) {
            data.push(null);
        }
 
        var div = section.find('div#example-sentences');
        div.data('sentences', data);
        div.find('div').pagination({
            // Decide how many pages there are.
            items: data.length,
            itemsOnPage: NUMBER_OF_ITEMS_PER_PAGE,
 
            // Always start on page 1.
            currentPage: 1,
 
            // Change the page manually.
            onPageClick: function(pageNumber, event) {
                DisplaySamplesSentencesPage(pageNumber, div);
            },
 
            // Display page 1 on init.
            onInit: function() {
                DisplaySamplesSentencesPage(1, div);
            }
        });
    }
 
    // Switch based on the content of the URL.
    var url = document.URL;
 
    // Process the vocabulary page.
    if (url.indexOf('vocabulary') != -1) {
        var vocabulary = $('header span.vocabulary-icon span').text();
 
        GetExampleSentencesForVocabulary(vocabulary, function(data) {
            if (data.length == 0) {
                return;
            }
 
            var section = GetSectionWithExamplesSentences(data);
            $('section.vocabulary-reading').after(section);
            SetupPaginationOnSectionWithSentenceData(section, data);
        });
    }
 
    // Process the review page.
    else if (url.indexOf('review/session') != -1) {
        // Display the information when the current item changes. Don't do this if they are
        // supposed to enter the reading.
        $.jStorage.listenKeyChange('currentItem', function(key) {
            var currentVocab = $.jStorage.get(key).voc;
            GetExampleSentencesForVocabulary(currentVocab, function(data) {
                // Make sure the current vocabulary still matches what is on the page (this
                // is to prevent multiple sentence boxes from showing up).
                if ($.jStorage.get(key).voc != currentVocab) {
                    return;
                }
 
                if (data.length == 0) {
                    return;
                }
 
                if ($('#answer-form input').attr('lang') != 'ja') {
                    var section = GetSectionWithExamplesSentences(data);
                    $('div#all-info').before(section.prepend('<br />'));
                    SetupPaginationOnSectionWithSentenceData(section, data);
                }
            });
        });
 
        // If the 'all-info' button is pressed, then display it.
        $('div#all-info').on('click', function() {
            GetExampleSentencesForVocabulary($.jStorage.get('currentItem').voc, function(data) {
                if (data.length == 0) {
                    return;
                }
 
                var section = GetSectionWithExamplesSentences(data);
                $('div#all-info').before(section.prepend('<br />'));
                SetupPaginationOnSectionWithSentenceData(section, data);
            });
        });
    }
 
    // Process the lesson page.
    else if (url.indexOf('lesson/session') != -1) {
        $.jStorage.listenKeyChange('l/currentLesson', function(key) {
            GetExampleSentencesForVocabulary($.jStorage.get(key).voc, function(data) {
                if (data.length == 0) {
                    return;
                }
 
                var section = GetSectionWithExamplesSentences(data);
                $('div#supplement-voc-meaning').append(section.prepend('<br />'));
                SetupPaginationOnSectionWithSentenceData(section, data);
            });
        });
    }
}
 
function EndsInUSound(japaneseWord) {
  return japaneseWord.match(/[るゆむふぬつすくう]/) != null;
}

function main() {
  console.log('got here');
  // If they haven't entered their API key, just show all sentences.
  var API_KEY = WaniKaniAPI.getAPIKey();
  if (API_KEY == undefined) {
    console.log('SHIT');
    DisplayExampleSentences(null);
    return;
  }

  // Default expiration timer to 1 day (24 hours, 60 minutes, 60 seconds, 1000 ms).
  var CACHE_EXPIRATION_TIMER_MS = 24 * 60 * 60 * 1000;

  // Load the unlocked vocab, initializing to an empty object.
  console.log(GM_getValue('wanikani-sentences-learned-cache'));
  var unlockedVocab = JSON.parse(GM_getValue('wanikani-sentences-learned-cache', "{'__cache-time': 0}"));
  var currentTime = (new Date().getTime());

  // If cache expired, update first then run main.
  if ((currentTime - unlockedVocab['__cache-time']) > CACHE_EXPIRATION_TIMER_MS) {
    LOG('Cache expired, refreshing known vocabulary.');
    WaniKaniAPI.load(WaniKaniAPI.apiURL('vocabulary'), function(data) {
      for (vocab of data.requested_information.general) {
        if (vocab.user_specific != null) {
          var kanji = vocab.character.replace(/〜/g, '');
          unlockedVocab[kanji] = kanji;

          if (EndsInUSound(kanji)) {
            unlockedVocab[kanji.substr(0, kanji.length - 1)] = kanji;
          }
        }
      }

      // Cache time in milliseconds since the epoch.
      unlockedVocab['__cache-time'] = (new Date().getTime());

      // Save the cache, then keep going with the main program.
      GM_setValue('wanikani-sentences-learned-cache', JSON.stringify(unlockedVocab));
      console.log(unlockedVocab);
      // DisplayExampleSentences(unlockedVocab);
    });
  } else {
    console.log(unlockedVocab);
    // DisplayExampleSentences(unlockedVocab);
  }
}

window.onload = main;
