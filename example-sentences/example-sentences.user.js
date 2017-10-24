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
// @grant       GM_addStyle
// ==/UserScript==

function DisplayExampleSentences(LEARNED_VOCABULARY) {
  //
  // Extract the Kanji from the current page. This will have a switch for each type of page, and
  // will do something different for each. This will only include vocabulary pages, reviews and
  // lessons.
  //
  function GetVocabularyKanjiFromPage() {
    // Vocabulary information page.
    if (document.URL.indexOf('vocabulary') != -1) {
      return $('header span.vocabulary-icon span').text().trim();
    }

    // Review page.
    else if (document.URL.indexOf('review/session') != -1) {
      return $.jStorage.get('currentItem').voc;
    }

    // Lesson page.
    else if (document.URL.indexOf('lesson/session') != -1) {
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
    if (document.URL.indexOf('vocabulary') != -1) {
      return $('section.vocabulary-reading p').text().trim();
    }

    // Review page.
    else if (document.URL.indexOf('review/session') != -1) {
      return $.jStorage.get('currentItem').kana[0];
    }

    // Lesson page.
    else if (document.URL.indexOf('lesson/session') != -1) {
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
    WaniKaniAPI.load('https://jeshuam.pythonanywhere.com/wanikani-sentences/' + vocabulary, complete);
  }

  //
  // Function to check whether a Japanese word only contains kana (hira- or katakana).
  //
  function OnlyContainsKanaOrPunctuation(japaneseWord) {
    return japaneseWord.match(/^[\u3000-\u30FF]+$/) !== null;
  }

  function GetSectionWithExamplesSentences(known_vocab, sentences) {
    // Make something that looks like this:
    let section = document.createElement('section');
    section.id = 'examples-sentences-section';
    section.innerHTML = `
<h2>More Context Sentences</h2>
<button id="example-sentences-toggle-display">Show All Sentences</button>
<div id="example-sentences"></div>
`;

    section.children[1].onclick = function() {
      if (this.innerText === 'Show All Sentences') {
        for (let element of document.querySelectorAll('.example-sentence-unlearned-vocab')) {
          element.style.display = 'block';
        }

        this.innerText = 'Show Only Known Vocab';
      } else {
        for (let element of document.querySelectorAll('.example-sentence-unlearned-vocab')) {
          element.style.display = 'none';
        }

        this.innerText = 'Show All Sentences';
      }
    };

    for (let sentence of sentences) {
      // Check if this sentence has any words we don't know.
      let extra_class = '';
      let kanji = GetVocabularyKanjiFromPage();
      let kana = GetVocabularyKanaFromPage();
      for (let word of sentence.jpn) {
        if (word != kanji && !OnlyContainsKanaOrPunctuation(word) && known_vocab[word] === undefined) {
          extra_class = 'example-sentence-unlearned-vocab';
          break;
        }
      }

      // Make the HTML for this sentence.
      var japanese_html = '';
      for (let word of sentence.jpn) {
        // Highlight the current word.
        if (word == kanji) {
          japanese_html += '<span class="vocabulary-highlight highlight-vocabulary" rel="tooltip" data-original-title="' + kana + '">' + kanji + '</span>';
        }

        // Insert a link to the WaniKani page for learned vocabulary.
        else if (known_vocab[word] !== undefined) {
          japanese_html += '<span><a href="https://www.wanikani.com/vocabulary/' + known_vocab[word] + '">' + word + '</a></span>';
        }

        // Otherwise, just put the word into the text.
        else {
          japanese_html += '<span>' + word + '</span>';
        }
      }

      let sentence_html = document.createElement('div');
      sentence_html.className = 'context-sentence-group ' + extra_class;
      sentence_html.innerHTML = `
<p lang="ja">${japanese_html}</p>
<p>${sentence.eng}</p>
`;

      section.children[2].appendChild(sentence_html);
    }

    if (section.children[2].children.length === 0) {
      section.children[2].innerHTML = 'No example sentences found for this word!';
    }

    return section;
  }

  // Process the vocabulary page.
  if (document.URL.indexOf('vocabulary') >= 0) {
    var vocabulary = $('header span.vocabulary-icon span').text();

    GetExampleSentencesForVocabulary(vocabulary, function(data) {
      if (data.length === 0) {
        return;
      }

      let section = GetSectionWithExamplesSentences(LEARNED_VOCABULARY, data);
      let insertion_section = document.querySelector('section.context-sentence');
      insertion_section.parentNode.insertBefore(section, insertion_section.nextSibling);
    });
  }

  // Process the review page.
  else if (document.URL.indexOf('review/session') >= 0) {
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
  else if (document.URL.indexOf('lesson/session') >= 0) {
    $.jStorage.listenKeyChange('l/currentLesson', function(key) {
      GetExampleSentencesForVocabulary($.jStorage.get(key).voc, function(data) {
        if (data.length == 0) {
          return;
        }

        var section = GetSectionWithExamplesSentences(LEARNED_VOCABULARY, data);
        let insertion_section = document.querySelector('div#supplement-voc-context-sentence');
        insertion_section.parentNode.insertBefore(section, insertion_section.nextSibling);
      });
    });
  }
}

function EndsInUSound(japaneseWord) {
  return japaneseWord.match(/[るゆむふぬつすくう]/) !== null;
}

function main() {
  // Get their API key. If we are on the account page, go no further.
  let API_KEY = WaniKaniAPI.getAPIKey();
  if (window.location.href.indexOf('account') >= 0) {
    return;
  }

  // Default expiration timer to 1 day (24 hours, 60 minutes, 60 seconds, 1000 ms).
  var CACHE_EXPIRATION_TIMER_MS = 24 * 60 * 60 * 1000;

  // Load the unlocked vocab, initializing to an empty object.
  var unlockedVocab = JSON.parse(GM_getValue('wanikani-sentences-learned-cache', '{"__cache-time": 0}'));
  var currentTime = (new Date().getTime());

  // If cache expired, update first then run main.
  if ((currentTime - unlockedVocab['__cache-time']) > CACHE_EXPIRATION_TIMER_MS) {
    console.log('EXAMPLE-SENTENCES: Cache expired, refreshing known vocabulary.');
    WaniKaniAPI.load(WaniKaniAPI.apiURL('vocabulary'), function(data) {
      for (let vocab of data.requested_information.general) {
        if (vocab.user_specific !== null) {
          // Remove any preceding ~ characters (as they aren't part of the word).
          var kanji = vocab.character.replace(/〜/g, '');
          unlockedVocab[kanji] = kanji;

          // For verbs, remove the U sound at the end. This should do a decent job of showing
          // the verb even if it is conjugated (it won't be perfect, but better than nothing).
          if (EndsInUSound(kanji)) {
            unlockedVocab[kanji.substr(0, kanji.length - 1)] = kanji;
          }
        }
      }

      // Cache time in milliseconds since the epoch.
      unlockedVocab['__cache-time'] = (new Date().getTime());

      // Save the cache, then keep going with the main program.
      GM_setValue('wanikani-sentences-learned-cache', JSON.stringify(unlockedVocab));
      DisplayExampleSentences(unlockedVocab);
    });
  } else {
    DisplayExampleSentences(unlockedVocab);
  }
}

// Add style.
GM_addStyle(`
div#example-sentences {
max-height: 400px;
overflow: auto;
}

.example-sentence-unlearned-vocab {
display: none;
}

#example-sentences-toggle-display {
margin-bottom: 20px;
}
`);

window.onload = main;